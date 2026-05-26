/**
 * Evento: Receta Médica Emitida (prescriptions.issued)
 * Publicado por prescription-service cuando un médico firma una receta.
 * Según FUNCIONAMIENTO.MD: "pharmacy-service toma la orden automáticamente"
 * consumiendo este tópico.
 * Consumido también por:
 * - ehr-service: para agregar la receta al historial del paciente
 * - audit-service: para registro legal en el Ledger
 */

import { HealthRecordChangedEvent } from './health-record-changed.event';

export interface PrescriptionIssuedEvent extends HealthRecordChangedEvent {
  eventType: 'prescription.issued';
  payload: {
    prescriptionId: string;
    patientId: string;
    doctorId: string;
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      durationDays: number;
    }>;
    digitalSignature: string;
  };
}
