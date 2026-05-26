/**
 * Interfaz del Repositorio de Citas (Port)
 * Define el contrato que la capa de infraestructura debe implementar.
 * Los casos de uso dependen de esta abstracción, NO de PostgreSQL directamente.
 * Esto permite testear la lógica de negocio con mocks y cambiar la BD sin
 * modificar el dominio (principio de inversión de dependencias - Clean Architecture).
 */

import { Appointment } from '../entities/appointment.entity';

export interface AppointmentRepository {
  findById(id: string): Promise<Appointment | null>;
  findByPatientId(patientId: string): Promise<Appointment[]>;
  findByDoctorId(doctorId: string, date: Date): Promise<Appointment[]>;
  save(appointment: Appointment): Promise<void>;
  update(appointment: Appointment): Promise<void>;
  delete(id: string): Promise<void>;
}
