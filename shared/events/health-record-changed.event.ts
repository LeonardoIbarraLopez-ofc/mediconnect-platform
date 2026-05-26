/**
 * Evento Base del Sistema: HealthRecordChanged
 * Contrato base que todos los eventos clínicos del sistema deben respetar.
 * Según ESTRUCTURA.MD: "Evento base: HealthRecordChanged (contiene metadata,
 * timestamp y firma HMAC)."
 * Todos los eventos publicados en Kafka extienden esta estructura para que
 * audit-service pueda procesarlos de forma uniforme y verificar su HMAC.
 */

export interface HealthRecordChangedEvent {
  /** ID del evento (UUID v4) */
  eventId: string;
  /** Tipo específico del evento (appointment.created, prescription.issued, etc.) */
  eventType: string;
  /** ID del paciente afectado por este cambio clínico */
  patientId: string;
  /** Contenido específico del evento (varía por tipo) */
  payload: object;
  metadata: {
    /** Nombre del microservicio que originó el evento */
    service: string;
    /** Timestamp ISO 8601 de cuando ocurrió el evento */
    timestamp: string;
    /** Firma HMAC-SHA256 del payload para verificación en audit-service */
    hmac: string;
    /** Versión del esquema del evento (para compatibilidad futura) */
    schemaVersion: string;
  };
}
