/**
 * DTO: Iniciar Sesión de Telemedicina
 * Parámetros requeridos para crear una sala WebRTC.
 * El appointmentId se usa para validar que la cita está confirmada
 * antes de permitir la conexión.
 */

export interface StartSessionDto {
  /** ID de la cita médica confirmada que origina esta videoconsulta */
  appointmentId: string;
  /** ID del paciente participante */
  patientId: string;
  /** ID del médico participante */
  doctorId: string;
}
