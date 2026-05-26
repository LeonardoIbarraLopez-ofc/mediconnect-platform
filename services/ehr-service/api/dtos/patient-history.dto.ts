/**
 * DTO: Historial Clínico del Paciente
 * Representa la respuesta que el EHR Service envía a los clientes.
 * Incluye flag 'hasPendingSync' para que el frontend muestre un aviso
 * cuando los datos del legado no pudieron sincronizarse (zona rural sin red).
 */

import { ClinicalRecord } from '../../domain/entities/patient-history.entity';

export interface PatientHistoryDto {
  patientId: string;
  nationalId: string;
  records: ClinicalRecord[];
  lastSyncedAt?: string;
  /** true si algún registro del legado no pudo sincronizarse */
  hasPendingSync: boolean;
}
