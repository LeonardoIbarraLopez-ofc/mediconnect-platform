/**
 * DTO: Dato de Telemetría IoT
 * Estructura del mensaje MQTT que envían los dispositivos médicos.
 * El campo 'value' puede ser un número simple (glucosa, SpO2)
 * o un objeto compuesto para la presión arterial (sistólica/diastólica).
 */

export interface TelemetryDto {
  /** ID del paciente monitorizado */
  patientId: string;
  /** ID único del dispositivo médico */
  deviceId: string;
  /** Tipo de métrica: glucose, blood_pressure, heart_rate, spo2 */
  metricType: string;
  /** Valor medido (número o {systolic, diastolic} para presión) */
  value: number | { systolic: number; diastolic: number };
  /** Unidad de medida: mg/dL, mmHg, bpm, % */
  unit: string;
  /** Timestamp del dispositivo en ISO 8601 */
  recordedAt: string;
}
