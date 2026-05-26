/**
 * Punto de Entrada: Telemedicine Service
 * Microservicio de videoconsultas cifradas con WebRTC.
 * Gestiona las sesiones de video, la grabación server-side y
 * el almacenamiento en S3. Al finalizar, emite eventos Kafka
 * para sincronizar con EHR y audit services.
 */

import express from 'express';
import { startSession, endSession } from './api/controllers/session.controller';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

app.get('/health', (_req, res) =>
  res.json({ status: 'ok', service: 'telemedicine-service' })
);

app.post('/sessions/start', startSession);
app.post('/sessions/:id/end', endSession);

app.listen(PORT, () => {
  console.log(`[Telemedicine Service] Escuchando en puerto ${PORT}`);
});
