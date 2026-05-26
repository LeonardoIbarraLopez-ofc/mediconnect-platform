/**
 * Entidad de Dominio: Sesión de Telemedicina
 * Representa una videoconsulta entre paciente y médico.
 * Contiene el estado del canal WebRTC y la URL de grabación en S3.
 * Al finalizar la sesión se genera el resumen clínico que será consumido
 * por ehr-service para enriquecer el historial del paciente.
 */

export type SessionStatus = 'waiting' | 'active' | 'ended' | 'failed';

export class TeleconsultationSession {
  public recordingUrl?: string;
  public clinicalSummary?: string;
  public endedAt?: Date;

  constructor(
    public readonly id: string,
    public readonly appointmentId: string,
    public readonly patientId: string,
    public readonly doctorId: string,
    public status: SessionStatus = 'waiting',
    public readonly startedAt: Date = new Date()
  ) {}

  activate(): void {
    if (this.status !== 'waiting') {
      throw new Error('Solo se puede activar una sesión en espera');
    }
    this.status = 'active';
  }

  end(recordingUrl: string, clinicalSummary: string): void {
    if (this.status !== 'active') {
      throw new Error('Solo se puede finalizar una sesión activa');
    }
    this.status = 'ended';
    this.recordingUrl = recordingUrl;
    this.clinicalSummary = clinicalSummary;
    this.endedAt = new Date();
  }

  markFailed(): void {
    this.status = 'failed';
    this.endedAt = new Date();
  }
}
