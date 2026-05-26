/**
 * Consumidor Kafka para Audit Service
 * Se suscribe a TODOS los tópicos de eventos del sistema para capturarlos
 * en el Ledger inmutable. Según FUNCIONAMIENTO.MD:
 * "audit-service captura todos los eventos anteriores, firmándolos y
 *  almacenándolos en la cadena de auditoría (Ledger)."
 *
 * Tópicos suscritos:
 *   - appointment.created
 *   - appointment.status_changed
 *   - session.ended
 *   - prescriptions.issued
 *   - alert.critical
 */

import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { RecordAuditEventUseCase } from '../../domain/use-cases/record-audit-event.usecase';
import { AuditEventType } from '../../domain/entities/audit-event.entity';

const kafka = new Kafka({
  clientId: 'audit-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
});

// Tópicos mapeados a tipos de eventos de auditoría
const TOPIC_TO_EVENT_TYPE: Record<string, AuditEventType> = {
  'appointment.created': 'appointment.created',
  'appointment.status_changed': 'appointment.status_changed',
  'session.ended': 'session.ended',
  'prescriptions.issued': 'prescription.issued',
  'alert.critical': 'alert.critical',
};

export class KafkaAuditConsumer {
  private consumer: Consumer;

  constructor(private readonly recordUseCase: RecordAuditEventUseCase) {
    this.consumer = kafka.consumer({ groupId: 'audit-service-group' });
  }

  async start(): Promise<void> {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topics: Object.keys(TOPIC_TO_EVENT_TYPE),
      fromBeginning: true, // Audit service necesita replay completo para consistencia
    });

    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        const { topic, message, partition, heartbeat } = payload;
        const raw = JSON.parse(message.value?.toString() || '{}');

        try {
          await this.recordUseCase.execute({
            type: TOPIC_TO_EVENT_TYPE[topic],
            sourceService: raw.metadata?.service || 'unknown',
            payload: raw,
            hmacSignature: raw.metadata?.hmac || '',
          });
          await heartbeat(); // Mantener la sesión Kafka viva en procesamiento largo
        } catch (error) {
          console.error(`[Audit] Error al registrar evento de ${topic}:`, error);
          // En producción: enviar a DLQ (Dead Letter Queue) para análisis
        }
      },
    });
  }

  async stop(): Promise<void> {
    await this.consumer.disconnect();
  }
}
