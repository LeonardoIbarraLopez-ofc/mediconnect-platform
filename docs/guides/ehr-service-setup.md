# Guía de Configuración: EHR Service (Dev 3)

Este documento detalla los prerrequisitos y pasos necesarios para levantar el microservicio de Historial Clínico (EHR) en el entorno local.

## 🛠 Prerrequisitos del Sistema

1. **Node.js** (v18 o superior)
2. **MongoDB**:
   - Instancia local corriendo en el puerto por defecto (`mongodb://localhost:27017`)
3. **Apache Kafka** (Opcional para pruebas básicas REST):
   - Broker corriendo localmente (`localhost:9092`). El EHR Service se suscribe a los eventos `session.ended` y `prescription.issued`.

## 🚀 Cómo levantar el EHR Service

**Pasos:**
1. Navega a la carpeta del servicio: `cd services/ehr-service`
2. Instala las dependencias: `npm install`
3. Inicia el servidor en modo desarrollo: `npm run dev`

**Endpoints de prueba rápida:**
- Verificación de salud: `GET http://localhost:3003/health`
- Historial paciente: `GET http://localhost:3003/ehr/patient/123?nationalId=8765432`