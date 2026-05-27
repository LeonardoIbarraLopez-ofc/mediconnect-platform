/**
 * Caso de Uso: Crear Cita Médica
 * Orquesta la lógica de negocio para agendar una nueva cita:
 * 1. Valida disponibilidad del doctor en el horario solicitado.
 * 2. Crea la entidad Appointment.
 * 3. Persiste via repositorio (PostgreSQL).
 * 4. Publica el evento appointment.created al bus Kafka para que
 *    telemedicine-service y notification-service reaccionen.
 */

import { v4 as uuidv4 } from 'uuid';
import { Appointment } from '../entities/appointment.entity.ts';
import { AppointmentRepository } from '../repositories/appointment.repository.ts';

interface CreateAppointmentInput {
  patientId: string;
  doctorId: string;
  scheduledAt: Date;
  specialty: string;
}

interface EventPublisher {
  publish(topic: string, event: object): Promise<void>;
}

export class CreateAppointmentUseCase {
  constructor(
    private readonly repository: AppointmentRepository,
    private readonly eventPublisher: EventPublisher
  ) {}

  async execute(input: CreateAppointmentInput): Promise<Appointment> {
    // Verificar conflicto de horario del médico
    const existingAppointments = await this.repository.findByDoctorId(
      input.doctorId,
      input.scheduledAt
    );

    const hasConflict = existingAppointments.some(
      (a) =>
        a.status !== 'cancelled' &&
        Math.abs(a.scheduledAt.getTime() - input.scheduledAt.getTime()) < 30 * 60 * 1000
    );

    if (hasConflict) {
      throw new Error('El médico ya tiene una cita en ese horario');
    }

    const appointment = new Appointment(
      uuidv4(),
      input.patientId,
      input.doctorId,
      input.scheduledAt,
      'scheduled',
      input.specialty
    );

    await this.repository.save(appointment);

    // Publicar evento en Kafka para notificaciones y telemedicina
    await this.eventPublisher.publish('appointment.created', {
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      scheduledAt: appointment.scheduledAt,
      specialty: appointment.specialty,
      timestamp: new Date().toISOString(),
    });

    return appointment;
  }
}
