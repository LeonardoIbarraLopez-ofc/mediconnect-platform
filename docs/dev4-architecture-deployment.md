# 🚀 Guía de Arquitectura, Despliegue e Integración del Dev 4
## MediConnect S.A.S. — Plataforma Nacional de Telemedicina

Este documento describe la arquitectura técnica, las mejoras visuales implementadas en el frontend y las instrucciones paso a paso para desplegar e integrar los componentes bajo el dominio del **Dev 4 (AI / Frontend + IoT + Auditoría)**.

---

## 🏗️ 1. Resumen de Componentes (Alcance Dev 4)

El dominio del **Dev 4** comprende tres capas clave de la plataforma:

1.  **`client/` (Frontend - PWA Offline-First)**
    *   **Tecnología**: React + Vite + TypeScript.
    *   **Función**: Portal clínico con control de citas, videoconsultas cifradas con AES-256 y accesibilidad, unificación del EHR (historia clínica), emisión de recetas con firmas criptográficas RSA-2048 y sincronización offline en segundo plano.
2.  **`services/iot-service/` (Backend - Telemetría IoT)**
    *   **Tecnología**: Node.js + Express + TypeScript + InfluxDB + MQTT.
    *   **Función**: Ingesta de telemetría de glucómetros, tensiómetros y oxímetros de pulso. Evalúa métricas y genera alertas críticas `alert.critical` en el bus.
3.  **`services/audit-service/` (Backend - Auditoría Regulatoria)**
    *   **Tecnología**: Node.js + Express + TypeScript + PostgreSQL + Kafka.
    *   **Función**: Ledger inmutable de auditoría forense (`append-only`) para cumplir con regulaciones ministeriales. Captura todos los eventos del bus, verifica firmas criptográficas y mantiene la consistencia de la cadena (Event Sourcing).

---

## ⚡ 2. Arquitectura de Resiliencia (Modo Híbrido: Standalone / Integrado)

Para garantizar una presentación fluida en la **Hackathon** sin sacrificar la compatibilidad de producción al integrarse con el resto del equipo, implementamos **Patrones de Tolerancia a Fallos Activos** en ambos microservicios backend:

### A. Resiliencia de Persistencia
*   **PostgreSQL Fallback (`audit-service`)**: Si PostgreSQL no está levantado localmente en el puerto `5432`, el cliente de base de datos activa automáticamente un **Ledger In-Memory**. Los eventos se persisten, secuencian y encadenan criptográficamente en memoria RAM de forma segura, permitiendo el uso total de la API.
*   **InfluxDB Fallback (`iot-service`)**: Si InfluxDB no responde en el puerto `8086`, las series de tiempo de telemetría médica se guardan en un repositorio caché local en memoria RAM.

### B. Resiliencia de Mensajería y Simulación Inteligente
*   **Simulador de Dispositivos Médicos MQTT (`iot-service`)**: El microservicio intenta conectarse a un broker Mosquitto MQTT en el puerto `1883`. 
    *   *Si no hay broker conectado (Hackathon/Standalone)*: Arranca un simulador clínico local en segundo plano que publica de forma periódica mediciones de sensores médicos (glucosa, SpO2, presión arterial) cada 6 segundos.
    *   *Si el broker real se conecta (Integración)*: El simulador **se apaga automáticamente** (`clearInterval`) para dejar paso exclusivamente al tráfico de sensores reales del equipo.
*   **Simulador de Eventos Firmados Kafka (`audit-service`)**: El consumidor de Kafka tiene una política de reconexión rápida (`retries: 1`). 
    *   *Si Kafka no responde*: Cambia a modo standalone y simula en segundo plano la recepción de eventos del sistema (citas agendadas, recetas emitidas, telemetría normal y alertas críticas). 
    *   *Firmas Criptográficas*: Cada evento simulado genera en caliente su respectiva firma digital **HMAC-SHA256** utilizando la clave compartida (`HMAC_SECRET`), lo que permite que pasen las validaciones forenses del caso de uso de Event Sourcing.

---

## 🎨 3. Rediseño Estético y Visual del Frontend

Se actualizó la interfaz del cliente PWA para reflejar un sistema premium y dinámico de grado médico-militar:

*   **Fondo 3D y Efectos Fluidos**: Se aumentó la opacidad y escala de la rejilla de perspectiva 3D (de 0.04 a 0.09) y se duplicó la velocidad de la animación. Los orbes de brillo de fondo ahora tienen colores HSL adaptativos que se mueven dinámicamente con transiciones fluidas.
*   **Reloj de Auditoría Sin Envoltura**: Se ajustó el reloj del header a formato de 24 horas continuo para prevenir que los sufijos AM/PM rompan el diseño en pantallas de menor resolución.
*   **Topología de Microservicios Dinámica**: La pestaña de arquitectura estática fue rediseñada para simular una **Topología Activa de Microservicios**. Muestra el estado operativo de los 7 componentes del sistema con LEDs parpadeantes de estado (`ACTIVE`/`RUNNING`), contadores de uptime reactivos, y flujos visuales que muestran puertos, tecnologías y colas Kafka.

---

## 🛠️ 4. Instrucciones de Despliegue (Cómo Hacer Correr Todo)

Sigue estos pasos para arrancar localmente la suite completa del **Dev 4**:

### Paso 1: Levantar el Frontend (`client`)
1.  Abre una terminal y navega a la carpeta del cliente:
    ```bash
    cd mediconnect-platform/client
    ```
2.  Instala las dependencias necesarias:
    ```bash
    npm install
    ```
3.  Arranca el servidor de desarrollo de Vite:
    ```bash
    npm run dev
    ```
    *El frontend estará disponible de inmediato en:* **`http://localhost:5173`**

### Paso 2: Levantar el Microservicio de Telemetría (`iot-service`)
1.  Abre otra terminal y navega al directorio del servicio:
    ```bash
    cd mediconnect-platform/services/iot-service
    ```
2.  Instala las dependencias necesarias:
    ```bash
    npm install
    ```
3.  Inicia el servicio en modo desarrollo:
    ```bash
    npm run dev
    ```
    *El microservicio estará escuchando llamadas en:* **`http://localhost:3005`**

### Paso 3: Levantar el Microservicio de Auditoría (`audit-service`)
1.  Abre una tercera terminal y navega al directorio del servicio:
    ```bash
    cd mediconnect-platform/services/audit-service
    ```
2.  Instala las dependencias necesarias:
    ```bash
    npm install
    ```
3.  Inicia el servicio en modo desarrollo:
    ```bash
    npm run dev
    ```
    *El microservicio estará escuchando llamadas en:* **`http://localhost:3006`**

---

## 📡 5. Pruebas y API Endpoints Disponibles

Puedes probar la conectividad y el funcionamiento de los microservicios ejecutando peticiones desde herramientas como ThunderClient, Postman o comandos `curl` / `Invoke-RestMethod`:

### A. Endpoints del `iot-service` (Puerto 3005)
*   **Chequeo de Salud**:
    *   `GET http://localhost:3005/health`
    *   *Respuesta*: `{ "status": "ok", "service": "iot-service" }`
*   **Obtener Historial de Telemetría**:
    *   `GET http://localhost:3005/telemetry/patient/:patientId` (ej: `pat-101`)
    *   *Respuesta*: Arreglo JSON con todas las lecturas de telemetría de glucosa, oxímetro y presión acumuladas en memoria.
*   **Obtener la Última Métrica Recibida**:
    *   `GET http://localhost:3005/telemetry/patient/:patientId/latest` (ej: `pat-101`)
    *   *Respuesta*: Objeto JSON detallado de la última lectura simulada por los sensores médicos.

### B. Endpoints del `audit-service` (Puerto 3006)
*   **Chequeo de Salud**:
    *   `GET http://localhost:3006/health`
    *   *Respuesta*: `{ "status": "ok", "service": "audit-service" }`
*   **Consultar Eventos del Ledger en un Rango de Secuencia**:
    *   `GET http://localhost:3006/audit/events?from=1&to=10`
    *   *Respuesta*: Lista paginada y ordenada de eventos firmados criptográficamente. Muestra la firma `hmacSignature` y el encadenamiento `previousEventHash` tipo Blockchain.
*   **Consultar el Historial de Auditoría de un Paciente**:
    *   `GET http://localhost:3006/audit/patient/:patientId/events` (ej: `pat-101`)
    *   *Respuesta*: Lista con todos los eventos de auditoría regulatoria correspondientes a ese paciente en particular.
