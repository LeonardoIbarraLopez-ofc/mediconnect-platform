/**
 * Controlador HTTP del Audit Service
 * Permite al Ministerio de Salud y auditores consultar el Ledger inmutable.
 * Endpoints:
 *   GET /audit/events/:id                 — Evento específico por ID
 *   GET /audit/events?from=&to=           — Rango de secuencia para auditoría
 *   GET /audit/patient/:patientId/events  — Todos los eventos de un paciente
 * IMPORTANTE: Este controlador es de solo lectura. No existe endpoint de escritura.
 * La escritura solo ocurre via Kafka (kafka.consumer.ts).
 */

import { Request, Response } from 'express';
import { PostgresLedgerRepository } from '../../infrastructure/db/postgres-ledger.client';

const repository = new PostgresLedgerRepository();

export async function getAuditEvent(req: Request, res: Response): Promise<void> {
  try {
    const event = await repository.findById(req.params.id);
    if (!event) {
      res.status(404).json({ error: 'Evento de auditoría no encontrado' });
      return;
    }
    res.json(event);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getAuditEventsByRange(req: Request, res: Response): Promise<void> {
  try {
    const from = parseInt(req.query.from as string || '1');
    const to = parseInt(req.query.to as string || '100');

    if (to - from > 1000) {
      res.status(400).json({ error: 'Rango máximo de 1000 eventos por consulta' });
      return;
    }

    const events = await repository.findBySequenceRange(from, to);
    res.json({ events, count: events.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getPatientAuditTrail(req: Request, res: Response): Promise<void> {
  try {
    const events = await repository.findByPatientId(req.params.patientId);
    res.json({ patientId: req.params.patientId, events, count: events.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
