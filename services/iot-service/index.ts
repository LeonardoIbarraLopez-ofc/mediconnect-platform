/**
 * Punto de Entrada: IoT Service
 * Microservicio de monitoreo crónico de pacientes vía dispositivos IoT.
 * Inicia el suscriptor MQTT para recibir métricas de dispositivos médicos
 * (glucómetros, tensiómetros, oxímetros) y expone la API REST para consultas.
 * Persistencia: InfluxDB (series de tiempo optimizada para telemetría masiva).
 * Alertas: publica alert.critical en Kafka cuando se detectan valores críticos.
 */

import express from 'express';
import { getPatientTelemetry, getLatestTelemetry } from './api/controllers/telemetry.controller';
import { MqttIoTSubscriber } from './infrastructure/mqtt/mqtt.subscriber';
import { EvaluateTelemetryUseCase } from './domain/use-cases/evaluate-telemetry.usecase';
import { InfluxTelemetryRepository } from './infrastructure/db/influxdb.client';

const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());

app.get('/health', (_req, res) =>
  res.json({ status: 'ok', service: 'iot-service' })
);

app.get('/telemetry/patient/:patientId', getPatientTelemetry);
app.get('/telemetry/patient/:patientId/latest', getLatestTelemetry);

// Iniciar suscriptor MQTT para ingesta de datos de dispositivos
const repository = new InfluxTelemetryRepository();
const evaluateUseCase = new EvaluateTelemetryUseCase(repository, {
  publish: async (topic, event) => {
    console.log(`[IoT] Publicando ${topic}:`, event);
    // En producción: inyectar KafkaProducer real
  },
});
const mqttSubscriber = new MqttIoTSubscriber(evaluateUseCase);
mqttSubscriber.start();

app.listen(PORT, () => {
  console.log(`[IoT Service] Escuchando en puerto ${PORT}`);
});
