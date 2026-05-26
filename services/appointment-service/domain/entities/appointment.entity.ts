/**
 * Entidad de Dominio: Cita Médica (Appointment)
 * Representa el concepto puro de una cita sin dependencias de infraestructura.
 * Contiene el estado de la cita (scheduled, confirmed, in-progress, completed, cancelled)
 * y las reglas de negocio para transicionar entre estados.
 * Al completarse, la entidad genera el evento appointment.created para Kafka.
 */

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export class Appointment {
  constructor(
    public readonly id: string,
    public readonly patientId: string,
    public readonly doctorId: string,
    public scheduledAt: Date,
    public status: AppointmentStatus,
    public readonly specialty: string,
    public notes?: string,
    public readonly createdAt: Date = new Date()
  ) {}

  confirm(): void {
    if (this.status !== 'scheduled') {
      throw new Error('Solo se pueden confirmar citas en estado "scheduled"');
    }
    this.status = 'confirmed';
  }

  start(): void {
    if (this.status !== 'confirmed') {
      throw new Error('Solo se pueden iniciar citas confirmadas');
    }
    this.status = 'in_progress';
  }

  complete(notes: string): void {
    if (this.status !== 'in_progress') {
      throw new Error('Solo se pueden completar citas en progreso');
    }
    this.notes = notes;
    this.status = 'completed';
  }

  cancel(): void {
    if (this.status === 'completed') {
      throw new Error('No se puede cancelar una cita ya completada');
    }
    this.status = 'cancelled';
  }
}
