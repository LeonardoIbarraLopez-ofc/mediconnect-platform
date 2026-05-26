/**
 * Entidad de Dominio: Receta Médica (Prescription)
 * Representa una receta emitida digitalmente por un médico.
 * Incluye la firma digital del médico (obligatoria para validez legal en Bolivia).
 * Al ser emitida, genera el evento prescription.issued que es consumido por:
 * - pharmacy-service: para preparar el despacho
 * - ehr-service: para registrar en el historial del paciente
 * - audit-service: para crear el registro inmutable en el Ledger
 */

export type PrescriptionStatus = 'draft' | 'signed' | 'dispensed' | 'cancelled';

export interface PrescribedMedication {
  name: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  instructions?: string;
}

export class Prescription {
  public digitalSignature?: string;
  public signedAt?: Date;
  public dispensedAt?: Date;

  constructor(
    public readonly id: string,
    public readonly patientId: string,
    public readonly doctorId: string,
    public readonly appointmentId: string,
    public medications: PrescribedMedication[],
    public status: PrescriptionStatus = 'draft',
    public readonly createdAt: Date = new Date()
  ) {}

  sign(digitalSignature: string): void {
    if (this.status !== 'draft') {
      throw new Error('Solo se pueden firmar recetas en borrador');
    }
    this.digitalSignature = digitalSignature;
    this.signedAt = new Date();
    this.status = 'signed';
  }

  markDispensed(): void {
    if (this.status !== 'signed') {
      throw new Error('Solo se pueden despachar recetas firmadas');
    }
    this.dispensedAt = new Date();
    this.status = 'dispensed';
  }

  cancel(): void {
    if (this.status === 'dispensed') {
      throw new Error('No se puede cancelar una receta ya despachada');
    }
    this.status = 'cancelled';
  }
}
