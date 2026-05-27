import { Kafka } from 'kafkajs';

export const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
export const HMAC_SECRET = process.env.HMAC_SECRET || 'mediconnect-hmac-secret';

export function createKafkaClient(clientId: string): Kafka {
  return new Kafka({ clientId, brokers: KAFKA_BROKERS });
}
