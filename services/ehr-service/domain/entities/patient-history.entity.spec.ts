import { describe, it, expect } from '@jest/globals';
import { PatientHistory, ClinicalRecord } from './patient-history.entity';

describe('PatientHistory Entity', () => {
  it('debe agregar un registro clínico correctamente (addRecord)', () => {
    // 1. Preparar
    const history = new PatientHistory('patient-123', 'national-123');
    const record: ClinicalRecord = {
      id: 'rec-001',
      date: new Date(),
      type: 'consultation',
      description: 'Chequeo general',
      source: 'modern'
    };

    // 2. Ejecutar
    history.addRecord(record);

    // 3. Validar
    expect(history.records.length).toBe(1);
    expect(history.records[0].id).toBe('rec-001');
  });

  it('debe detectar si hay registros pendientes de sincronización (hasPendingSync)', () => {
    // 1. Preparar
    const history = new PatientHistory('patient-123', 'national-123');
    const record: ClinicalRecord = {
      id: 'rec-002',
      date: new Date(),
      type: 'lab_result',
      description: 'Laboratorio de sangre (Legado)',
      source: 'legacy',
      syncPending: true // Marcamos que falló el COBOL
    };

    // 2. Ejecutar
    history.addRecord(record);

    // 3. Validar
    expect(history.hasPendingSync()).toBe(true);
  });

  it('debe retornar false si no hay registros pendientes', () => {
    const history = new PatientHistory('patient-123', 'national-123');
    expect(history.hasPendingSync()).toBe(false);
  });
});