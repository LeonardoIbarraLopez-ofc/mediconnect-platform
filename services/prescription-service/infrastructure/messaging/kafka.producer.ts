/**
 * Productor Kafka para Prescription Service
 * Publica en el tópico 'prescriptions.issued' cuando una receta es firmada.
 * Consumido por ehr-service y audit-service.
 */

import { BaseKafkaProducer } from '../../../../shared/kafka/base-producer';

export class KafkaPrescriptionProducer extends BaseKafkaProducer {
  protected get serviceName(): string {
    return 'prescription-service';
  }

  constructor() {
    super('prescription-service');
  }
}
