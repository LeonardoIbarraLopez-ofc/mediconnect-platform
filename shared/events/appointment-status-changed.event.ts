/**
 * Evento: Estado de Cita Cambiado (appointment.status_changed)
 * Publicado por appointment-service cuando una cita transiciona de estado.
 * Consumido por:
 * - audit-service: para registro en el Ledger inmutable
 * - notification-service: para alertar al paciente y médico del cambio
 */

import { HealthRecordChangedEvent } from './health-record-changed.event';

export interface AppointmentStatusChangedEvent extends HealthRecordChangedEvent {
  eventType: 'appointment.status_changed';
  payload: {
    appointmentId: string;
    patientId: string;
    doctorId: string;
    previousStatus: string;
    newStatus: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
    notes?: string;
    changedAt: string;
  };
}
