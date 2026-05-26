/**
 * Evento: Cita Médica Creada (appointment.created)
 * Publicado por appointment-service cuando se agenda una nueva cita.
 * Consumido por:
 * - notification-service: para enviar confirmación al paciente y médico
 * - telemedicine-service: para preparar la sala WebRTC anticipadamente
 * - audit-service: para registro en el Ledger inmutable
 */

import { HealthRecordChangedEvent } from './health-record-changed.event';

export interface AppointmentCreatedEvent extends HealthRecordChangedEvent {
  eventType: 'appointment.created';
  payload: {
    appointmentId: string;
    patientId: string;
    doctorId: string;
    scheduledAt: string;
    specialty: string;
  };
}
