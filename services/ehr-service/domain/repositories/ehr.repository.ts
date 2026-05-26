/**
 * Interfaz del Repositorio EHR (Port)
 * El historial se persiste en MongoDB por su esquema flexible,
 * ideal para registros clínicos heterogéneos que evolucionan con el tiempo.
 * La búsqueda por nationalId permite integración con el sistema COBOL.
 */

import { PatientHistory } from '../entities/patient-history.entity';

export interface EhrRepository {
  findByPatientId(patientId: string): Promise<PatientHistory | null>;
  findByNationalId(nationalId: string): Promise<PatientHistory | null>;
  save(history: PatientHistory): Promise<void>;
  update(history: PatientHistory): Promise<void>;
}
