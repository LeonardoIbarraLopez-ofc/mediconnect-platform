/**
 * Consumidor Kafka Base
 * Maneja el ciclo de vida de conexión/suscripción/desconexión.
 * Las subclases implementan `topics`, `fromBeginning` y `handleMessage`.
 */

import { Consumer, EachMessagePayload } from 'kafkajs';
import { createKafkaClient } from './kafka-client';

export abstract class BaseKafkaConsumer {
  protected consumer: Consumer;

  constructor(
    private readonly clientId: string,
    groupId: string
  ) {
    this.consumer = createKafkaClient(clientId).consumer({ groupId });
  }

  abstract get topics(): string[];
  abstract get fromBeginning(): boolean;
  abstract handleMessage(topic: string, event: unknown): Promise<void>;

  async start(): Promise<void> {
    await this.consumer.connect();
    await this.consumer.subscribe({ topics: this.topics, fromBeginning: this.fromBeginning });

    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        const { topic, message, heartbeat } = payload;
        const event = JSON.parse(message.value?.toString() || '{}');
        try {
          await this.handleMessage(topic, event);
          await heartbeat();
        } catch (error) {
          console.error(`[${this.clientId}] Error procesando evento en ${topic}:`, error);
        }
      },
    });
  }

  async stop(): Promise<void> {
    await this.consumer.disconnect();
  }
}
