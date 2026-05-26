/**
 * Interfaz del Repositorio de Auditoría (Port)
 * La persistencia usa PostgreSQL con una tabla de solo-inserción (append-only).
 * Se implementa con una política de base de datos que previene UPDATE y DELETE.
 * Esto garantiza la inmutabilidad del Ledger sin depender solo del código.
 * El método findLatestSequenceNumber permite encadenar eventos correctamente.
 */

import { AuditEvent } from '../entities/audit-event.entity';

export interface AuditRepository {
  save(event: AuditEvent): Promise<void>;
  findById(id: string): Promise<AuditEvent | null>;
  findBySequenceRange(from: number, to: number): Promise<AuditEvent[]>;
  findLatestSequenceNumber(): Promise<number>;
  findByPatientId(patientId: string): Promise<AuditEvent[]>;
}
