/**
 * DTO: Emitir Receta Médica
 * Parámetros requeridos para crear y firmar una receta.
 * Cada medicamento incluye dosis, frecuencia e instrucciones especiales.
 */

import { PrescribedMedication } from '../../domain/entities/prescription.entity';

export interface IssuePrescriptionDto {
  patientId: string;
  doctorId: string;
  appointmentId: string;
  /** Lista de medicamentos prescritos con dosis y frecuencia */
  medications: PrescribedMedication[];
}
