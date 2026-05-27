/**
 * Evento: Sesión de Telemedicina Finalizada (session.ended)
 * Publicado por telemedicine-service al cerrar una videoconsulta.
 * Consumido por:
 * - ehr-service: integra el resumen clínico al historial del paciente
 * - audit-service: registro inmutable en el Ledger
 */

import { HealthRecordChangedEvent } from './health-record-changed.event';

export interface SessionEndedEvent extends HealthRecordChangedEvent {
  eventType: 'session.ended';
  payload: {
    sessionId: string;
    appointmentId: string;
    patientId: string;
    doctorId: string;
    clinicalSummary: string;
    recordingUrl?: string;
    durationMinutes: number;
    endedAt: string;
  };
}
