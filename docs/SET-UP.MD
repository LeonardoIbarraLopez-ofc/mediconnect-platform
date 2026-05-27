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


### Paso 4: Cómo levantar el EHR Service

    **Pasos:**
    1. Navega a la carpeta del servicio: `cd services/ehr-service`
    2. Instala las dependencias: `npm install`
    3. Inicia el servidor en modo desarrollo: `npm run dev`

### Paso 5: Levantar Appointment-service (Gestión de Citas - Puerto 3001):
    Abre una terminal en la carpeta del servicio:
    bash
    cd mediconnect-platform/services/appointment-service
    Arranca el servicio con la resiliencia y base de datos local en memoria:
    powershell
    $env:PORT="3001"; $env:POSTGRES_HOST="localhost"; $env:POSTGRES_DB="appointments_db"; $env:POSTGRES_USER="mediconnect"; $env:POSTGRES_PASSWORD="secret"; $env:KAFKA_BROKERS="localhost:9092"; npm run dev

### Paso 6: Levantar el telemedicine-service (Videoconsultas WebRTC - Puerto 3002):
    Abre una terminal en la carpeta del servicio:
    bash
    cd mediconnect-platform/services/telemedicine-service
    Arranca el servicio en modo desarrollo (ya con los typings y los mocks reparados de forma local):
    powershell
    $env:PORT="3002"; $env:KAFKA_BROKERS="localhost:9092"; npm run dev