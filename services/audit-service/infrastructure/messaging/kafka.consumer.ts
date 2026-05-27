/**
 * Consumidor Kafka para Audit Service
 * Se suscribe a TODOS los tópicos del sistema para registrar cada evento
 * en el Ledger inmutable. fromBeginning: true garantiza replay completo
 * al reiniciar (consistencia del Ledger ante reinicios del servicio).
 *
 * Tópicos: appointment.created, appointment.status_changed, session.ended,
 *          prescriptions.issued, alert.critical
 */

import { BaseKafkaConsumer } from '../../../../shared/kafka/base-consumer';
import { RecordAuditEventUseCase } from '../../domain/use-cases/record-audit-event.usecase';
import { AuditEventType } from '../../domain/entities/audit-event.entity';

const TOPIC_TO_EVENT_TYPE: Record<string, AuditEventType> = {
  'appointment.created': 'appointment.created',
  'appointment.status_changed': 'appointment.status_changed',
  'session.ended': 'session.ended',
  'prescriptions.issued': 'prescription.issued',
  'alert.critical': 'alert.critical',
};

export class KafkaAuditConsumer extends BaseKafkaConsumer {
  constructor(private readonly recordUseCase: RecordAuditEventUseCase) {
    super('audit-service', 'audit-service-group');
  }

  get topics(): string[] {
    return Object.keys(TOPIC_TO_EVENT_TYPE);
  }

  get fromBeginning(): boolean {
    return true;
  }

  async handleMessage(topic: string, event: unknown): Promise<void> {
    const raw = event as Record<string, any>;
    await this.recordUseCase.execute({
      type: TOPIC_TO_EVENT_TYPE[topic],
      sourceService: raw.metadata?.service || 'unknown',
      payload: raw,
      hmacSignature: raw.metadata?.hmac || '',
    });
  }
}
