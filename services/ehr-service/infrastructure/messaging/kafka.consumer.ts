/**
 * Consumidor Kafka para EHR Service
 * Se suscribe a los tópicos Kafka relevantes para el historial clínico:
 *   - session.ended: al finalizar una videoconsulta, integra el resumen clínico
 *   - prescription.issued: registra la receta en el historial del paciente
 * Esto permite que el EHR se actualice automáticamente sin acoplamiento directo
 * con los otros microservicios (comunicación asíncrona event-driven).
 */

import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'ehr-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
});

export class KafkaEhrConsumer {
  private consumer: Consumer;

  constructor() {
    this.consumer = kafka.consumer({ groupId: 'ehr-service-group' });
  }

  async start(): Promise<void> {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topics: ['session.ended', 'prescription.issued'],
      fromBeginning: false,
    });

    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        const { topic, message } = payload;
        const event = JSON.parse(message.value?.toString() || '{}');
        console.log(`[EHR Kafka] Evento recibido en ${topic}:`, event);

        switch (topic) {
          case 'session.ended':
            await this.handleSessionEnded(event);
            break;
          case 'prescription.issued':
            await this.handlePrescriptionIssued(event);
            break;
        }
      },
    });
  }

  private async handleSessionEnded(event: any): Promise<void> {
    // Agregar resumen clínico al historial del paciente
    console.log(`[EHR] Integrando resumen de sesión ${event.sessionId} al historial`);
    // En implementación real: llamar al use case AddClinicalRecord
  }

  private async handlePrescriptionIssued(event: any): Promise<void> {
    // Registrar receta en el historial del paciente
    console.log(`[EHR] Registrando receta ${event.prescriptionId} en historial`);
  }

  async stop(): Promise<void> {
    await this.consumer.disconnect();
  }
}
