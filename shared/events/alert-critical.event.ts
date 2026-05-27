/**
 * Evento: Alerta Crítica IoT (alert.critical)
 * Publicado por iot-service cuando una métrica supera el umbral clínico.
 * Consumido por:
 * - audit-service: registro inmutable en el Ledger
 * - notification-service: SMS/Push al médico tratante
 */

import { HealthRecordChangedEvent } from './health-record-changed.event';

export interface AlertCriticalEvent extends HealthRecordChangedEvent {
  eventType: 'alert.critical';
  payload: {
    alertId: string;
    patientId: string;
    deviceId: string;
    metricType: 'glucose' | 'blood_pressure' | 'heart_rate' | 'spo2';
    value: number;
    unit: string;
    threshold: number;
    triggeredAt: string;
  };
}
