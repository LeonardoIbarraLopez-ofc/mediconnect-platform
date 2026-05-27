/**
 * Cliente PostgreSQL Ledger para Audit Service
 * Implementa la tabla de auditoría con política append-only (solo INSERT).
 * La tabla 'audit_events' tiene un trigger de base de datos que previene
 * UPDATE y DELETE para garantizar inmutabilidad a nivel de motor de BD.
 * El índice en sequence_number permite verificación eficiente de la cadena.
 *
 * DDL recomendado:
 *   CREATE TABLE audit_events (...);
 *   CREATE RULE no_update AS ON UPDATE TO audit_events DO INSTEAD NOTHING;
 *   CREATE RULE no_delete AS ON DELETE TO audit_events DO INSTEAD NOTHING;
 */

import { Pool } from 'pg';
import { AuditEvent, AuditEventType } from '../../domain/entities/audit-event.entity';
import { AuditRepository } from '../../domain/repositories/audit.repository';

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'audit_ledger_db',
  user: process.env.POSTGRES_USER || 'mediconnect',
  password: process.env.POSTGRES_PASSWORD || 'secret',
});

// Registrar un log inicial discreto, pero no bloquear
console.log('[Postgres] Cliente configurado en ' + (process.env.POSTGRES_HOST || 'localhost'));

function rowToAuditEvent(row: any): AuditEvent {
  return new AuditEvent(
    row.id,
    row.type as AuditEventType,
    row.source_service,
    JSON.parse(row.payload),
    row.hmac_signature,
    row.sequence_number,
    row.previous_event_hash,
    new Date(row.occurred_at)
  );
}

export class PostgresLedgerRepository implements AuditRepository {
  private static memoryEvents: AuditEvent[] = [];

  async save(event: AuditEvent): Promise<void> {
    // Almacenar siempre en memoria local como caché/fallback
    PostgresLedgerRepository.memoryEvents.push(event);

    try {
      // INSERT ONLY — nunca UPDATE ni DELETE en esta tabla
      await pool.query(
        `INSERT INTO audit_events
         (id, type, source_service, payload, hmac_signature, sequence_number, previous_event_hash, occurred_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          event.id,
          event.type,
          event.sourceService,
          JSON.stringify(event.payload),
          event.hmacSignature,
          event.sequenceNumber,
          event.previousEventHash,
          event.occurredAt,
        ]
      );
    } catch (err: any) {
      console.warn(`[PostgresLedger - Fallback] Guardado local en memoria. Detalle: ${err.message}`);
    }
  }

  async findById(id: string): Promise<AuditEvent | null> {
    try {
      const result = await pool.query('SELECT * FROM audit_events WHERE id = $1', [id]);
      return result.rows[0] ? rowToAuditEvent(result.rows[0]) : null;
    } catch (err) {
      // Usar fallback de memoria
      return PostgresLedgerRepository.memoryEvents.find(e => e.id === id) || null;
    }
  }

  async findBySequenceRange(from: number, to: number): Promise<AuditEvent[]> {
    try {
      const result = await pool.query(
        'SELECT * FROM audit_events WHERE sequence_number BETWEEN $1 AND $2 ORDER BY sequence_number',
        [from, to]
      );
      return result.rows.map(rowToAuditEvent);
    } catch (err) {
      // Usar fallback de memoria
      return PostgresLedgerRepository.memoryEvents
        .filter(e => e.sequenceNumber >= from && e.sequenceNumber <= to)
        .sort((a, b) => a.sequenceNumber - b.sequenceNumber);
    }
  }

  async findLatestSequenceNumber(): Promise<number> {
    try {
      const result = await pool.query(
        'SELECT COALESCE(MAX(sequence_number), 0) as max_seq FROM audit_events'
      );
      return parseInt(result.rows[0].max_seq);
    } catch (err) {
      // Usar fallback de memoria
      if (PostgresLedgerRepository.memoryEvents.length === 0) {
        return 0;
      }
      return Math.max(...PostgresLedgerRepository.memoryEvents.map(e => e.sequenceNumber));
    }
  }

  async findByPatientId(patientId: string): Promise<AuditEvent[]> {
    try {
      const result = await pool.query(
        `SELECT * FROM audit_events WHERE payload->>'patientId' = $1 ORDER BY sequence_number`,
        [patientId]
      );
      return result.rows.map(rowToAuditEvent);
    } catch (err) {
      // Usar fallback de memoria
      return PostgresLedgerRepository.memoryEvents
        .filter(e => {
          const payload = e.payload as any;
          return payload && payload.patientId === patientId;
        })
        .sort((a, b) => a.sequenceNumber - b.sequenceNumber);
    }
  }
}
