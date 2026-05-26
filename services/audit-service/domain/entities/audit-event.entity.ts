/**
 * Entidad de Dominio: Evento de Auditoría (AuditEvent)
 * Núcleo del mecanismo de Ledger inmutable del sistema.
 * Cada AuditEvent representa una acción clínica significativa que ocurrió.
 * NUNCA se modifica ni elimina un evento (append-only, Event Sourcing).
 * Cada evento tiene:
 * - Número de secuencia incremental global (para detectar gaps/manipulaciones)
 * - Firma HMAC del contenido (para verificación del Ministerio de Salud)
 * - Hash del evento anterior (encadenamiento tipo blockchain simplificado)
 * El Ministerio puede auditar la cadena completa en cualquier momento.
 */

export type AuditEventType =
  | 'appointment.created'
  | 'appointment.status_changed'
  | 'session.ended'
  | 'prescription.issued'
  | 'ehr.accessed'
  | 'alert.critical';

export class AuditEvent {
  constructor(
    public readonly id: string,
    public readonly type: AuditEventType,
    public readonly sourceService: string,
    public readonly payload: object,
    public readonly hmacSignature: string,
    public readonly sequenceNumber: number,
    public readonly previousEventHash: string,
    public readonly occurredAt: Date = new Date()
  ) {}

  // Calcular hash de este evento para encadenar con el siguiente
  computeHash(): string {
    const content = JSON.stringify({
      id: this.id,
      type: this.type,
      payload: this.payload,
      sequenceNumber: this.sequenceNumber,
      previousEventHash: this.previousEventHash,
      occurredAt: this.occurredAt,
    });
    // En producción: usar SHA-256 real
    return Buffer.from(content).toString('base64');
  }
}
