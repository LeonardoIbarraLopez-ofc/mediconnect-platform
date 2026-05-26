/**
 * Entidad de Dominio: Historial Clínico del Paciente (PatientHistory)
 * Objeto central del EHR Service. Consolida datos de múltiples fuentes:
 * - Sistema moderno (MediConnect): consultas, recetas, grabaciones
 * - Sistema legado COBOL del Ministerio: historial previo digitalizado
 * Los registros del legado se marcan con 'source: legacy' y nunca se modifican.
 * Los registros modernos siguen Event Sourcing (append-only).
 */

export type RecordSource = 'modern' | 'legacy';

export interface ClinicalRecord {
  id: string;
  date: Date;
  type: 'consultation' | 'prescription' | 'lab_result' | 'recording';
  description: string;
  attachmentUrl?: string;
  source: RecordSource;
  syncPending?: boolean; // true cuando el legado no respondió y se usó caché
}

export class PatientHistory {
  constructor(
    public readonly patientId: string,
    public readonly nationalId: string, // Cédula de identidad boliviana
    public records: ClinicalRecord[] = [],
    public readonly createdAt: Date = new Date(),
    public lastSyncedAt?: Date
  ) {}

  addRecord(record: ClinicalRecord): void {
    this.records.push(record);
  }

  getRecentRecords(limit = 10): ClinicalRecord[] {
    return [...this.records]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  }

  hasPendingSync(): boolean {
    return this.records.some((r) => r.syncPending);
  }
}
