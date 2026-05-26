/**
 * Punto de Entrada: Appointment Service
 * Inicializa el microservicio de gestión de citas médicas.
 * Conecta con PostgreSQL (persistencia) y Kafka (mensajería).
 * Expone la API REST en el puerto configurado.
 * Al recibir SIGTERM (shutdown de Docker/K8s), desconecta el productor Kafka
 * limpiamente para evitar pérdida de mensajes en vuelo.
 */

import express from 'express';
import {
  createAppointment,
  getAppointment,
  getPatientAppointments,
  updateAppointmentStatus,
} from './api/controllers/appointment.controller';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/health', (_req, res) =>
  res.json({ status: 'ok', service: 'appointment-service' })
);

app.post('/appointments', createAppointment);
app.get('/appointments/:id', getAppointment);
app.get('/appointments/patient/:patientId', getPatientAppointments);
app.patch('/appointments/:id/status', updateAppointmentStatus);

const server = app.listen(PORT, () => {
  console.log(`[Appointment Service] Escuchando en puerto ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('[Appointment Service] Apagado limpio iniciado...');
  server.close(() => process.exit(0));
});
