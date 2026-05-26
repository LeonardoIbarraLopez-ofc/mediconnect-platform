/**
 * Interfaz del Repositorio de Telemetría (Port)
 * InfluxDB fue elegido para telemetría IoT por ser una base de datos
 * de series de tiempo optimizada para escrituras masivas de métricas.
 * Permite queries eficientes como "promedio de glucosa en los últimos 7 días".
 */

import { TelemetryReading } from '../entities/telemetry.entity';

export interface TelemetryRepository {
  save(reading: TelemetryReading): Promise<void>;
  findByPatientId(
    patientId: string,
    from: Date,
    to: Date
  ): Promise<TelemetryReading[]>;
  findLatestByPatientId(patientId: string): Promise<TelemetryReading | null>;
}
