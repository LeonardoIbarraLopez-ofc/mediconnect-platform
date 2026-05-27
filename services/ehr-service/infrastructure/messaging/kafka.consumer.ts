/**
 * Consumidor Kafka para EHR Service
 * Reacciona a eventos de telemedicina y prescripciones para mantener
 * el historial clínico actualizado sin acoplamiento directo a otros servicios.
 *
 * Tópicos:
 *   - session.ended: integra el resumen clínico al historial del paciente
 *   - prescriptions.issued: registra la receta emitida en el historial
 */

import { BaseKafkaConsumer } from '../../../../shared/kafka/base-consumer';

export class KafkaEhrConsumer extends BaseKafkaConsumer {
  constructor() {
    super('ehr-service', 'ehr-service-group');
  }

  get topics(): string[] {
    return ['session.ended', 'prescriptions.issued'];
  }

  get fromBeginning(): boolean {
    return false;
  }

  async handleMessage(topic: string, event: unknown): Promise<void> {
    switch (topic) {
      case 'session.ended':
        await this.handleSessionEnded(event as Record<string, any>);
        break;
      case 'prescriptions.issued':
        await this.handlePrescriptionIssued(event as Record<string, any>);
        break;
    }
  }

  private async handleSessionEnded(event: Record<string, any>): Promise<void> {
    // TODO: llamar a AddClinicalRecordUseCase con el resumen de sesión
    const { sessionId, clinicalSummary } = event.payload ?? event;
    void sessionId;
    void clinicalSummary;
  }

  private async handlePrescriptionIssued(event: Record<string, any>): Promise<void> {
    // TODO: llamar a AddClinicalRecordUseCase con la receta emitida
    const { prescriptionId } = event.payload ?? event;
    void prescriptionId;
  }
}
