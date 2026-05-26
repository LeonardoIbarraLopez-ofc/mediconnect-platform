/**
 * Legacy Adapter (Anti-Corruption Layer) — Componente Crítico
 * Traduce las respuestas del sistema COBOL del Ministerio de Salud de Bolivia
 * al modelo de dominio PatientHistory de MediConnect.
 *
 * Por qué existe esta capa (según ESTRUCTURA.MD):
 * "Evitar que el legado contamine la nueva lógica"
 * El sistema COBOL retorna datos en formato plano con códigos propietarios.
 * Este adaptador los convierte en objetos PatientHistory del dominio moderno,
 * aislando completamente al resto del sistema de los detalles del legado.
 *
 * Si el Ministerio actualiza su API, solo este archivo debe cambiar.
 */

import { PatientHistory, ClinicalRecord } from '../../domain/entities/patient-history.entity';

// Formato crudo que retorna la API REST del Ministerio (sobre el sistema COBOL)
interface CobolPatientRecord {
  CI: string;           // Cédula de identidad
  NOM: string;          // Nombre completo
  FECHA: string;        // Fecha en formato DD/MM/YYYY
  TIPO_REG: string;     // Tipo de registro (CON=consulta, LAB=laboratorio, REC=receta)
  DESCR: string;        // Descripción del registro
  COD_MED: string;      // Código del médico
}

interface CobolApiResponse {
  PACIENTE: CobolPatientRecord[];
  STATUS: 'OK' | 'ERR';
  MSG?: string;
}

export class CobolLegacyAdapter {
  private readonly ministryApiUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.ministryApiUrl =
      process.env.MINISTRY_API_URL || 'https://api.minsalud.gob.bo/legado';
    this.apiKey = process.env.MINISTRY_API_KEY || '';
  }

  async fetchPatientHistory(nationalId: string): Promise<PatientHistory | null> {
    const response = await fetch(`${this.ministryApiUrl}/paciente/${nationalId}`, {
      headers: {
        'X-API-Key': this.apiKey,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(5000), // timeout 5s para no bloquear si el COBOL está lento
    });

    if (!response.ok) return null;

    const data: CobolApiResponse = await response.json();

    if (data.STATUS !== 'OK' || !data.PACIENTE?.length) return null;

    // Convertir registros COBOL al modelo de dominio MediConnect
    const records: ClinicalRecord[] = data.PACIENTE.map((raw) => ({
      id: `legacy-${raw.CI}-${raw.FECHA}-${raw.COD_MED}`,
      date: this.parseCobolDate(raw.FECHA),
      type: this.mapCobolType(raw.TIPO_REG),
      description: raw.DESCR,
      source: 'legacy' as const,
      syncPending: false,
    }));

    return new PatientHistory(
      `legacy-${nationalId}`,
      nationalId,
      records
    );
  }

  // COBOL usa DD/MM/YYYY, el dominio usa Date objects
  private parseCobolDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  // Mapear códigos propietarios COBOL a tipos del dominio MediConnect
  private mapCobolType(cobolType: string): ClinicalRecord['type'] {
    const map: Record<string, ClinicalRecord['type']> = {
      CON: 'consultation',
      LAB: 'lab_result',
      REC: 'prescription',
    };
    return map[cobolType] ?? 'consultation';
  }
}
