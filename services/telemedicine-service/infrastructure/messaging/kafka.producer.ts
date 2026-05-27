/**
 * Productor Kafka para Telemedicine Service
 * Publica en el tópico 'session.ended' cuando finaliza una videoconsulta.
 * Consumido por ehr-service (resumen clínico) y audit-service (Ledger).
 */

import { BaseKafkaProducer } from '../../../../shared/kafka/base-producer';
import { SessionEndedEvent } from '../../../../shared/events/session-ended.event';

export class KafkaTelemedicineProducer extends BaseKafkaProducer {
  protected get serviceName(): string {
    return 'telemedicine-service';
  }

  constructor() {
    super('telemedicine-service');
  }

  async publishSessionEnded(
    payload: SessionEndedEvent['payload'] & { eventId: string; patientId: string }
  ): Promise<void> {
    await this.publish('session.ended', {
      eventId: payload.eventId,
      eventType: 'session.ended',
      patientId: payload.patientId,
      payload,
    });
  }
}
