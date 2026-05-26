/**
 * Interfaz del Repositorio de Recetas (Port)
 * PostgreSQL fue elegido para recetas por su soporte transaccional:
 * garantiza que una receta firmada y su evento Kafka se emitan juntos
 * (usando transacciones distribuidas o el patrón Outbox).
 */

import { Prescription } from '../entities/prescription.entity';

export interface PrescriptionRepository {
  findById(id: string): Promise<Prescription | null>;
  findByPatientId(patientId: string): Promise<Prescription[]>;
  findByAppointmentId(appointmentId: string): Promise<Prescription | null>;
  save(prescription: Prescription): Promise<void>;
  update(prescription: Prescription): Promise<void>;
}
