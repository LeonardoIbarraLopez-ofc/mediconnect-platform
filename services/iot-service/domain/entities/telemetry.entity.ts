/**
 * Entidad de Dominio: Dato de Telemetría IoT
 * Representa una medición de un dispositivo médico del paciente.
 * Tipos soportados: glucosa, presión arterial, frecuencia cardíaca, SpO2.
 * Contiene la regla de negocio crítica: si la presión sistólica > 140,
 * el sistema debe disparar una alerta crítica (alert.critical) al bus Kafka
 * que el notification-service traduce en un SMS/Push inmediato al médico.
 */

export type MetricType = 'glucose' | 'blood_pressure' | 'heart_rate' | 'spo2';

export interface BloodPressureValue {
  systolic: number;
  diastolic: number;
}

export class TelemetryReading {
  constructor(
    public readonly id: string,
    public readonly patientId: string,
    public readonly deviceId: string,
    public readonly metricType: MetricType,
    public readonly value: number | BloodPressureValue,
    public readonly unit: string,
    public readonly recordedAt: Date = new Date()
  ) {}

  isCritical(): boolean {
    if (this.metricType === 'blood_pressure') {
      const bp = this.value as BloodPressureValue;
      // Regla según FUNCIONAMIENTO.MD: presión sistólica > 140 → alerta crítica
      return bp.systolic > 140;
    }
    if (this.metricType === 'glucose') {
      // Hipoglucemia severa o hiperglucemia crítica
      return (this.value as number) < 50 || (this.value as number) > 400;
    }
    if (this.metricType === 'spo2') {
      return (this.value as number) < 90;
    }
    return false;
  }
}
