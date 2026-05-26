/**
 * DTO Base para Eventos del Sistema
 * Estructura mínima que todo evento publicado en el bus Kafka debe tener.
 * Los microservicios que producen eventos usan esta interfaz para garantizar
 * que el audit-service pueda procesarlos sin conocer el tipo específico.
 */

export interface BaseEventDto {
  eventId: string;
  eventType: string;
  timestamp: string;
  metadata: {
    service: string;
    hmac: string;
    schemaVersion: string;
  };
}
