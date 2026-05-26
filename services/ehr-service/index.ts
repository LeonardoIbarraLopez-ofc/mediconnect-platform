/**
 * Punto de Entrada: EHR Service (Electronic Health Record)
 * Microservicio de historial clínico con integración al sistema legado COBOL.
 * Inicia el consumidor Kafka para sincronización asíncrona de eventos
 * (session.ended, prescription.issued) y expone la API REST.
 * Persistencia: MongoDB (esquema flexible para registros clínicos heterogéneos).
 */

import express from 'express';
import { getPatientHistory, getHistoryByNationalId } from './api/controllers/ehr.controller';
import { KafkaEhrConsumer } from './infrastructure/messaging/kafka.consumer';

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

app.get('/health', (_req, res) =>
  res.json({ status: 'ok', service: 'ehr-service' })
);

app.get('/ehr/patient/:patientId', getPatientHistory);
app.get('/ehr/national-id/:nationalId', getHistoryByNationalId);

// Iniciar consumidor Kafka para recibir eventos de sesiones y recetas
const consumer = new KafkaEhrConsumer();
consumer.start().catch(console.error);

app.listen(PORT, () => {
  console.log(`[EHR Service] Escuchando en puerto ${PORT}`);
});
