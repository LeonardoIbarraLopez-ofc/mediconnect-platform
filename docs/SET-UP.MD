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

### Paso 4: Levantar el Microservicio de Gestión de Citas (`appointment-service`)
1.  Abre una cuarta terminal y navega al directorio del servicio:
    ```bash
    cd mediconnect-platform/services/appointment-service
    ```
2.  Instala las dependencias necesarias:
    ```bash
    npm install
    ```
3.  Inicia el servicio en modo desarrollo con las variables de entorno de base de datos y mensajería Kafka (con fallback resiliente in-memory):
    ```powershell
    $env:PORT="3001"; $env:POSTGRES_HOST="localhost"; $env:POSTGRES_DB="appointments_db"; $env:POSTGRES_USER="mediconnect"; $env:POSTGRES_PASSWORD="secret"; $env:KAFKA_BROKERS="localhost:9092"; npm run dev
    ```
    *El microservicio estará escuchando llamadas en:* **`http://localhost:3001`**

### Paso 5: Levantar el Microservicio de Telemedicina (`telemedicine-service`)
1.  Abre una quinta terminal y navega al directorio del servicio:
    ```bash
    cd mediconnect-platform/services/telemedicine-service
    ```
2.  Instala las dependencias necesarias:
    ```bash
    npm install
    ```
3.  Inicia el servicio en modo desarrollo (con reparación de typings y contingencia de repositorios in-memory integrada):
    ```powershell
    $env:PORT="3002"; $env:KAFKA_BROKERS="localhost:9092"; npm run dev
    ```
    *El microservicio estará escuchando llamadas en:* **`http://localhost:3002`**

### Paso 6: Levantar el API Gateway (`api-gateway` - Puerto 3010)
El API Gateway consolida las rutas y aplica autenticación JWT, Rate Limiting y Circuit Breakers.
1.  Abre una sexta terminal y navega a la carpeta del gateway:
    ```bash
    cd mediconnect-platform/api-gateway
    ```
2.  Instala las dependencias necesarias:
    ```bash
    npm install
    ```
3.  Inicia el gateway configurando la redirección en el puerto 3010 para evitar conflictos con otros puertos locales en tu máquina:
    ```powershell
    $env:PORT="3010"; $env:JWT_SECRET="mediconnect-jwt-secret"; $env:APPOINTMENT_SERVICE_URL="http://localhost:3001"; $env:TELEMEDICINE_SERVICE_URL="http://localhost:3002"; $env:EHR_SERVICE_URL="http://localhost:3003"; $env:PRESCRIPTION_SERVICE_URL="http://localhost:3004"; $env:IOT_SERVICE_URL="http://localhost:3005"; $env:AUDIT_SERVICE_URL="http://localhost:3006"; npm run dev
    ```
    *El API Gateway centralizado estará escuchando en:* **`http://localhost:3010`**

---

### 🔑 Generación y Uso de Tokens JWT para Pruebas (Postman)
Para probar los endpoints del gateway (todas las rutas `/api/v1/...`), debes generar un token e inyectarlo como cabecera `Authorization: Bearer <token>`:

1.  Generar token usando Node:
    ```bash
    cd mediconnect-platform/api-gateway
    node -e "const jwt=require('jsonwebtoken'); console.log(jwt.sign({userId:'u-001',role:'doctor',email:'doctor@mediconnect.bo'},'mediconnect-jwt-secret',{expiresIn:'8h'}))"
    ```
2.  Pega el token generado en Postman bajo la pestaña **"Authorization"**, selecciona **"Bearer Token"** y pégalo allí (asegúrate de que no haya espacios ni saltos de línea al final del token).
3.  Endpoints de salud integrados para validar:
    *   **Citas**: `GET http://localhost:3010/api/v1/appointments/health`
    *   **Telemedicina**: `GET http://localhost:3010/api/v1/telemedicine/health`
    *   **Telemetría**: `GET http://localhost:3010/api/v1/iot/health`
    *   **Auditoría**: `GET http://localhost:3010/api/v1/audit/health`