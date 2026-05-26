/**
 * Punto de Entrada: Prescription Service
 * Microservicio de recetas médicas con firma digital RSA.
 * Al emitir una receta, publica en 'prescriptions.issued' para que
 * pharmacy-service tome la orden y audit-service cree el registro inmutable.
 * Persistencia: PostgreSQL (garantías ACID para la firma digital).
 */

import express from 'express';
import {
  issuePrescription,
  getPrescription,
  getPatientPrescriptions,
} from './api/controllers/prescription.controller';

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

app.get('/health', (_req, res) =>
  res.json({ status: 'ok', service: 'prescription-service' })
);

app.post('/prescriptions', issuePrescription);
app.get('/prescriptions/:id', getPrescription);
app.get('/prescriptions/patient/:patientId', getPatientPrescriptions);

app.listen(PORT, () => {
  console.log(`[Prescription Service] Escuchando en puerto ${PORT}`);
});
