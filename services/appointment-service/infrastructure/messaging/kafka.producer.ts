/**
 * Productor Kafka para Appointment Service
 * Publica eventos de dominio al bus Kafka.
 * Tópicos:
 *   - appointment.created: cuando se agenda una nueva cita
 *   - appointment.status_changed: al confirmar, iniciar, completar o cancelar
 */

import { BaseKafkaProducer } from '../../../../shared/kafka/base-producer';

export class KafkaAppointmentProducer extends BaseKafkaProducer {
  protected get serviceName(): string {
    return 'appointment-service';
  }

  constructor() {
    super('appointment-service');
  }
}
