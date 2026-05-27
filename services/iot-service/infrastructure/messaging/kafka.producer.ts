/**
 * Productor Kafka para IoT Service
 * Publica en el tópico 'alert.critical' cuando una métrica supera el umbral.
 * Consumido por audit-service (Ledger) y notification-service (SMS/Push).
 */

import { BaseKafkaProducer } from '../../../../shared/kafka/base-producer';
import { AlertCriticalEvent } from '../../../../shared/events/alert-critical.event';

export class KafkaIotProducer extends BaseKafkaProducer {
  protected get serviceName(): string {
    return 'iot-service';
  }

  constructor() {
    super('iot-service');
  }

  async publishAlertCritical(
    payload: AlertCriticalEvent['payload'] & { eventId: string }
  ): Promise<void> {
    await this.publish('alert.critical', {
      eventId: payload.eventId,
      eventType: 'alert.critical',
      patientId: payload.patientId,
      payload,
    });
  }
}
