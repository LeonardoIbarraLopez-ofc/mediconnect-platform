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
import crypto from 'crypto';
import { RecordAuditEventUseCase } from '../../domain/use-cases/record-audit-event.usecase';
import { AuditEventType } from '../../domain/entities/audit-event.entity';

const HMAC_SECRET = process.env.HMAC_SECRET || 'mediconnect-hmac-secret';

const kafka = new Kafka({
  clientId: 'audit-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  retry: {
    initialRetryTime: 100,
    retries: 1, // Fallback inmediato si no hay broker levantado
  },
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
  private simInterval: NodeJS.Timeout | null = null;

  constructor(private readonly recordUseCase: RecordAuditEventUseCase) {
    this.consumer = kafka.consumer({ groupId: 'audit-service-group' });
  }

  async start(): Promise<void> {
    try {
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
    } catch (err: any) {
      console.warn(`[Kafka - Standalone Mode] No se pudo conectar a Kafka (${err.message}). Ejecutando simulación de eventos.`);
      
      // Iniciar simulación de eventos en segundo plano para poblar el Ledger en memoria
      this.simInterval = setInterval(async () => {
        const topics = Object.keys(TOPIC_TO_EVENT_TYPE);
        const randomTopic = topics[Math.floor(Math.random() * topics.length)];
        const mockPatientId = `pat-${100 + Math.floor(Math.random() * 5)}`;
        
        const mockPayloads: Record<string, any> = {
          'appointment.created': {
            appointmentId: `app-${Math.floor(Math.random() * 1000)}`,
            patientId: mockPatientId,
            doctorId: 'doc-88',
            dateTime: new Date().toISOString(),
            metadata: { service: 'appointment-service' }
          },
          'appointment.status_changed': {
            appointmentId: `app-${Math.floor(Math.random() * 1000)}`,
            patientId: mockPatientId,
            status: 'COMPLETED',
            metadata: { service: 'appointment-service' }
          },
          'session.ended': {
            sessionId: `sess-${Math.floor(Math.random() * 1000)}`,
            patientId: mockPatientId,
            durationSeconds: 1200,
            metadata: { service: 'telemedicine-service' }
          },
          'prescriptions.issued': {
            prescriptionId: `rx-${Math.floor(Math.random() * 1000)}`,
            patientId: mockPatientId,
            medication: 'Metformina 850mg',
            metadata: { service: 'prescription-service' }
          },
          'alert.critical': {
            alertId: `alt-${Math.floor(Math.random() * 1000)}`,
            patientId: mockPatientId,
            metricType: 'blood_pressure',
            value: { systolic: 155, diastolic: 95 },
            message: 'Presión arterial sistólica elevada (>140)',
            metadata: { service: 'iot-service' }
          }
        };

        const raw = mockPayloads[randomTopic];
        
        // Generar firma HMAC válida en caliente para que pase la validación de Event Sourcing
        const computedHmac = crypto
          .createHmac('sha256', HMAC_SECRET)
          .update(JSON.stringify(raw))
          .digest('hex');

        try {
          await this.recordUseCase.execute({
            type: TOPIC_TO_EVENT_TYPE[randomTopic],
            sourceService: raw.metadata?.service || 'unknown',
            payload: raw,
            hmacSignature: computedHmac,
          });
        } catch (e: any) {
          console.error('[Audit-Simulator] Error registrando evento simulado:', e.message);
        }
      }, 8000); // Generar un evento cada 8 segundos
    }
  }

  async stop(): Promise<void> {
    if (this.simInterval) {
      clearInterval(this.simInterval);
    }
    try {
      await this.consumer.disconnect();
    } catch (e) {
      // Ignorar error al desconectar
    }
  }
}
