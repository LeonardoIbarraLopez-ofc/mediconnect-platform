/**
 * Productor Kafka para Prescription Service
 * Publica en el tópico 'prescriptions.issued' cuando una receta es firmada.
 * Según FUNCIONAMIENTO.MD: "pharmacy-service toma la orden automáticamente"
 * consumiendo este tópico. También audit-service lo captura para el Ledger.
 */

import { Kafka, Producer } from 'kafkajs';
import crypto from 'crypto';

const kafka = new Kafka({
  clientId: 'prescription-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
});

const HMAC_SECRET = process.env.HMAC_SECRET || 'mediconnect-hmac-secret';

export class KafkaPrescriptionProducer {
  private producer: Producer;
  private connected = false;

  constructor() {
    this.producer = kafka.producer();
  }

  async connect(): Promise<void> {
    await this.producer.connect();
    this.connected = true;
  }

  async publish(topic: string, event: object): Promise<void> {
    if (!this.connected) await this.connect();

    const payload = {
      ...event,
      metadata: {
        service: 'prescription-service',
        timestamp: new Date().toISOString(),
        hmac: crypto
          .createHmac('sha256', HMAC_SECRET)
          .update(JSON.stringify(event))
          .digest('hex'),
      },
    };

    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(payload) }],
    });
  }
}
