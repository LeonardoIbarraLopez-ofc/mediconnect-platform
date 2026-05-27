/**
 * Productor Kafka para Appointment Service
 * Publica eventos de dominio al bus de mensajería Kafka.
 * Los tópicos usados por este servicio son:
 *   - appointment.created: cuando se agenda una nueva cita
 *   - appointment.status_changed: al confirmar, iniciar, completar o cancelar
 * Los eventos incluyen firma HMAC (HealthRecordChanged base) para que
 * el audit-service pueda verificar su autenticidad al consumirlos.
 */

import { Kafka, Producer } from 'kafkajs';
import crypto from 'crypto';

const kafka = new Kafka({
  clientId: 'appointment-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
});

const HMAC_SECRET = process.env.HMAC_SECRET || 'mediconnect-hmac-secret';

export class KafkaAppointmentProducer {
  private producer: Producer;
  private connected = false;

  constructor() {
    this.producer = kafka.producer();
  }

  async connect(): Promise<void> {
    try {
      await this.producer.connect();
      this.connected = true;
      console.log('[Kafka] Productor appointment-service conectado');
    } catch (err: any) {
      console.warn(`[Kafka - Standalone Mode] No se pudo conectar productor Kafka (${err.message}). Ejecutando en contingencia.`);
      this.connected = false;
    }
  }

  async publish(topic: string, event: object): Promise<void> {
    const payload = {
      ...event,
      metadata: {
        service: 'appointment-service',
        timestamp: new Date().toISOString(),
        // Firma HMAC para verificación en audit-service
        hmac: crypto
          .createHmac('sha256', HMAC_SECRET)
          .update(JSON.stringify(event))
          .digest('hex'),
      },
    };

    if (this.connected) {
      try {
        await this.producer.send({
          topic,
          messages: [{ value: JSON.stringify(payload) }],
        });
        return;
      } catch (err) {
        console.warn('[Kafka] Falló envío real de mensaje. Usando fallback standalone local.');
      }
    }

    console.log(`[Kafka - Standalone - LocalPublish] Tópico [${topic}]:`, payload);
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      try {
        await this.producer.disconnect();
      } catch (e) {}
    }
    this.connected = false;
  }
}
