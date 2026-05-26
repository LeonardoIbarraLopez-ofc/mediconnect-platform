/**
 * Caso de Uso: Finalizar Sesión de Telemedicina
 * Al terminar la videoconsulta:
 * 1. Sube la grabación cifrada a S3.
 * 2. Guarda el resumen clínico del médico.
 * 3. Actualiza el estado de la sesión a 'ended'.
 * 4. Emite evento 'session.ended' al bus Kafka para que ehr-service
 *    consuma el resumen y lo integre al historial clínico del paciente.
 */

import { SessionRepository } from '../repositories/session.repository';

interface StorageService {
  uploadRecording(sessionId: string, fileBuffer: Buffer): Promise<string>;
}

interface EventPublisher {
  publish(topic: string, event: object): Promise<void>;
}

export class EndSessionUseCase {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly storageService: StorageService,
    private readonly eventPublisher: EventPublisher
  ) {}

  async execute(
    sessionId: string,
    recordingBuffer: Buffer,
    clinicalSummary: string
  ): Promise<void> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new Error(`Sesión ${sessionId} no encontrada`);
    }

    // Subir grabación a S3 y obtener URL de acceso
    const recordingUrl = await this.storageService.uploadRecording(sessionId, recordingBuffer);

    session.end(recordingUrl, clinicalSummary);
    await this.sessionRepository.update(session);

    // Notificar a ehr-service para enriquecer el historial
    await this.eventPublisher.publish('session.ended', {
      sessionId: session.id,
      appointmentId: session.appointmentId,
      patientId: session.patientId,
      doctorId: session.doctorId,
      recordingUrl,
      clinicalSummary,
      timestamp: new Date().toISOString(),
    });
  }
}
