/**
 * Caso de Uso: Registrar Evento de Auditoría en el Ledger
 * Implementa el mecanismo de Event Sourcing descrito en FUNCIONAMIENTO.MD:
 * "Valida la firma HMAC, asigna un número de secuencia y persiste el evento.
 *  Nunca se borra ni modifica información."
 *
 * Flujo:
 * 1. Verifica la firma HMAC del evento recibido (autenticidad del origen).
 * 2. Obtiene el último número de secuencia del Ledger.
 * 3. Calcula el hash del evento anterior para encadenamiento.
 * 4. Asigna el siguiente número de secuencia al nuevo evento.
 * 5. Persiste el evento en el Ledger (PostgreSQL append-only).
 */

import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { AuditEvent, AuditEventType } from '../entities/audit-event.entity';
import { AuditRepository } from '../repositories/audit.repository';

const HMAC_SECRET = process.env.HMAC_SECRET || 'mediconnect-hmac-secret';

interface IncomingEvent {
  type: AuditEventType;
  sourceService: string;
  payload: object;
  hmacSignature: string;
}

export class RecordAuditEventUseCase {
  constructor(private readonly repository: AuditRepository) {}

  async execute(incoming: IncomingEvent): Promise<AuditEvent> {
    // 1. Validar firma HMAC para garantizar que el evento no fue manipulado
    const expectedHmac = crypto
      .createHmac('sha256', HMAC_SECRET)
      .update(JSON.stringify(incoming.payload))
      .digest('hex');

    if (expectedHmac !== incoming.hmacSignature) {
      throw new Error(
        `[Audit] Firma HMAC inválida para evento ${incoming.type} de ${incoming.sourceService}`
      );
    }

    // 2. Obtener contexto del Ledger para encadenamiento
    const lastSequence = await this.repository.findLatestSequenceNumber();
    const nextSequence = lastSequence + 1;

    // Hash del evento anterior (para cadena de auditoría verificable)
    let previousEventHash = '0'.repeat(64); // génesis si es el primer evento
    if (lastSequence > 0) {
      const [previousEvent] = await this.repository.findBySequenceRange(
        lastSequence,
        lastSequence
      );
      if (previousEvent) {
        previousEventHash = previousEvent.computeHash();
      }
    }

    // 3. Crear y persistir el evento de auditoría
    const auditEvent = new AuditEvent(
      uuidv4(),
      incoming.type,
      incoming.sourceService,
      incoming.payload,
      incoming.hmacSignature,
      nextSequence,
      previousEventHash
    );

    await this.repository.save(auditEvent);

    console.log(
      `[Audit] Evento #${nextSequence} registrado: ${incoming.type} (${incoming.sourceService})`
    );

    return auditEvent;
  }
}
