/**
 * DTO: Evento de Auditoría
 * Representación del Ledger que se expone a auditores externos (Ministerio).
 * Incluye la firma HMAC y el hash de encadenamiento para verificación
 * de la integridad de la cadena de auditoría completa.
 */

export interface AuditEventDto {
  id: string;
  type: string;
  sourceService: string;
  payload: object;
  hmacSignature: string;
  /** Número de secuencia global incremental en el Ledger */
  sequenceNumber: number;
  /** Hash SHA-256 del evento anterior en la cadena */
  previousEventHash: string;
  occurredAt: string;
}
