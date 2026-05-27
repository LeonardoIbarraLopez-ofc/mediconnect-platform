/**
 * Productor Kafka Base
 * Encapsula la conexión, firma HMAC-SHA256 y publicación de eventos.
 * Cada microservicio extiende esta clase y declara su serviceName.
 * Esto elimina la duplicación de lógica HMAC en cada productor individual.
 */

import { Producer } from 'kafkajs';
import crypto from 'crypto';
import { createKafkaClient, HMAC_SECRET } from './kafka-client';

export abstract class BaseKafkaProducer {
  private producer: Producer;
  private connected = false;

  constructor(clientId: string) {
    this.producer = createKafkaClient(clientId).producer();
  }

  protected abstract get serviceName(): string;

  async connect(): Promise<void> {
    if (this.connected) return;
    await this.producer.connect();
    this.connected = true;
  }

  async publish(topic: string, event: object): Promise<void> {
    if (!this.connected) await this.connect();

    const payload = {
      ...event,
      metadata: {
        service: this.serviceName,
        timestamp: new Date().toISOString(),
        hmac: crypto.createHmac('sha256', HMAC_SECRET).update(JSON.stringify(event)).digest('hex'),
        schemaVersion: '1.0',
      },
    };

    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(payload) }],
    });
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;
    await this.producer.disconnect();
    this.connected = false;
  }
}
