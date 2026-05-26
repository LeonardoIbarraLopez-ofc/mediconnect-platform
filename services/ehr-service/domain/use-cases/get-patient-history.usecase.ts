/**
 * Caso de Uso: Obtener Historial Clínico del Paciente
 * Flujo según FUNCIONAMIENTO.MD:
 * 1. Busca el historial en MongoDB (caché local).
 * 2. Consulta el sistema COBOL del Ministerio via Legacy-Adapter.
 * 3. Si el COBOL no responde, usa la caché y marca 'syncPending = true'.
 * 4. Fusiona los registros del legado con los registros modernos.
 * 5. Retorna el historial consolidado al cliente.
 */

import { PatientHistory } from '../entities/patient-history.entity';
import { EhrRepository } from '../repositories/ehr.repository';

interface LegacyAdapter {
  fetchPatientHistory(nationalId: string): Promise<PatientHistory | null>;
}

export class GetPatientHistoryUseCase {
  constructor(
    private readonly repository: EhrRepository,
    private readonly legacyAdapter: LegacyAdapter
  ) {}

  async execute(patientId: string, nationalId: string): Promise<PatientHistory> {
    // Intentar obtener historial moderno de MongoDB
    let history = await this.repository.findByPatientId(patientId);

    if (!history) {
      history = new PatientHistory(patientId, nationalId);
    }

    // Consultar al sistema legado COBOL
    try {
      const legacyHistory = await this.legacyAdapter.fetchPatientHistory(nationalId);
      if (legacyHistory) {
        // Fusionar registros del legado que no estén ya en el historial moderno
        for (const legacyRecord of legacyHistory.records) {
          const alreadyExists = history.records.some((r) => r.id === legacyRecord.id);
          if (!alreadyExists) {
            history.addRecord({ ...legacyRecord, source: 'legacy' });
          }
        }
        history.lastSyncedAt = new Date();
      }
    } catch {
      // Si el legado no responde: usar caché y marcar sincronización pendiente
      console.warn(`[EHR] Sistema legado no disponible para paciente ${nationalId}. Usando caché.`);
      history.records.forEach((r) => {
        if (r.source === 'legacy') r.syncPending = true;
      });
    }

    await this.repository.save(history);
    return history;
  }
}
