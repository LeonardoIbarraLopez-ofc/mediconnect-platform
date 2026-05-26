/**
 * Punto de Entrada: Audit Service
 * Servicio de auditoría con garantía legal (Event Sourcing + Ledger inmutable).
 * Inicia el consumidor Kafka que captura TODOS los eventos del sistema y los
 * persiste en el Ledger PostgreSQL de forma append-only (nunca UPDATE/DELETE).
 * Expone API de solo lectura para que el Ministerio pueda auditar la cadena.
 * Cumple el requisito regulatorio de auditoría inmutable para telemedicina.
 */

import express from 'express';
import { getAuditEvent, getAuditEventsByRange, getPatientAuditTrail } from './api/controllers/audit.controller';
import { KafkaAuditConsumer } from './infrastructure/messaging/kafka.consumer';
import { RecordAuditEventUseCase } from './domain/use-cases/record-audit-event.usecase';
import { PostgresLedgerRepository } from './infrastructure/db/postgres-ledger.client';

const app = express();
const PORT = process.env.PORT || 3006;

app.use(express.json());

app.get('/health', (_req, res) =>
  res.json({ status: 'ok', service: 'audit-service' })
);

// Endpoints de solo lectura para auditoría ministerial
app.get('/audit/events/:id', getAuditEvent);
app.get('/audit/events', getAuditEventsByRange);
app.get('/audit/patient/:patientId/events', getPatientAuditTrail);

// Iniciar consumidor Kafka (la fuente de verdad para escritura en el Ledger)
const ledgerRepository = new PostgresLedgerRepository();
const recordUseCase = new RecordAuditEventUseCase(ledgerRepository);
const kafkaConsumer = new KafkaAuditConsumer(recordUseCase);
kafkaConsumer.start().catch(console.error);

app.listen(PORT, () => {
  console.log(`[Audit Service] Ledger activo en puerto ${PORT}`);
});
