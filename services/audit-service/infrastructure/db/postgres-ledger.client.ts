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
  async save(event: AuditEvent): Promise<void> {
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
  }

  async findById(id: string): Promise<AuditEvent | null> {
    const result = await pool.query('SELECT * FROM audit_events WHERE id = $1', [id]);
    return result.rows[0] ? rowToAuditEvent(result.rows[0]) : null;
  }

  async findBySequenceRange(from: number, to: number): Promise<AuditEvent[]> {
    const result = await pool.query(
      'SELECT * FROM audit_events WHERE sequence_number BETWEEN $1 AND $2 ORDER BY sequence_number',
      [from, to]
    );
    return result.rows.map(rowToAuditEvent);
  }

  async findLatestSequenceNumber(): Promise<number> {
    const result = await pool.query(
      'SELECT COALESCE(MAX(sequence_number), 0) as max_seq FROM audit_events'
    );
    return parseInt(result.rows[0].max_seq);
  }

  async findByPatientId(patientId: string): Promise<AuditEvent[]> {
    const result = await pool.query(
      `SELECT * FROM audit_events WHERE payload->>'patientId' = $1 ORDER BY sequence_number`,
      [patientId]
    );
    return result.rows.map(rowToAuditEvent);
  }
}
