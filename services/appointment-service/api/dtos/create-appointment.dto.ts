/**
 * DTO: Crear Cita Médica (Data Transfer Object)
 * Define la forma del body esperado en POST /appointments.
 * Separa la representación de la API del modelo de dominio interno.
 * En producción se puede añadir validación con class-validator o zod.
 */

export interface CreateAppointmentDto {
  /** ID del paciente que agenda la cita */
  patientId: string;
  /** ID del médico con quien se agenda */
  doctorId: string;
  /** Fecha y hora de la cita en formato ISO 8601 */
  scheduledAt: string;
  /** Especialidad médica (ej: "cardiología", "medicina general") */
  specialty: string;
}
