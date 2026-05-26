/**
 * Caso de Uso: Actualizar Estado de Cita
 * Maneja las transiciones de estado de una cita médica.
 * Permite confirmar, iniciar, completar o cancelar una cita.
 * Cada transición exitosa publica un evento en Kafka (appointment.status_changed)
 * para que los servicios interesados (audit, notification) reaccionen.
 */

import { AppointmentStatus, Appointment } from '../entities/appointment.entity';
import { AppointmentRepository } from '../repositories/appointment.repository';

interface EventPublisher {
  publish(topic: string, event: object): Promise<void>;
}

export class UpdateAppointmentStatusUseCase {
  constructor(
    private readonly repository: AppointmentRepository,
    private readonly eventPublisher: EventPublisher
  ) {}

  async execute(
    appointmentId: string,
    newStatus: AppointmentStatus,
    notes?: string
  ): Promise<Appointment> {
    const appointment = await this.repository.findById(appointmentId);
    if (!appointment) {
      throw new Error(`Cita ${appointmentId} no encontrada`);
    }

    switch (newStatus) {
      case 'confirmed':
        appointment.confirm();
        break;
      case 'in_progress':
        appointment.start();
        break;
      case 'completed':
        if (!notes) throw new Error('Se requieren notas clínicas al completar la cita');
        appointment.complete(notes);
        break;
      case 'cancelled':
        appointment.cancel();
        break;
      default:
        throw new Error(`Transición de estado no soportada: ${newStatus}`);
    }

    await this.repository.update(appointment);

    await this.eventPublisher.publish('appointment.status_changed', {
      appointmentId: appointment.id,
      newStatus: appointment.status,
      timestamp: new Date().toISOString(),
    });

    return appointment;
  }
}
