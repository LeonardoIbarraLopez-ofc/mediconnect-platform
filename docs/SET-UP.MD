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