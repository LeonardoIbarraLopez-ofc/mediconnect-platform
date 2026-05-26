/**
 * Cliente InfluxDB para IoT Service
 * InfluxDB es la base de datos de series de tiempo elegida para telemetría.
 * Ventajas sobre PostgreSQL para este caso:
 * - Escrituras de alta frecuencia (miles de métricas/segundo)
 * - Queries nativas de series de tiempo (media móvil, downsampling)
 * - Retención automática de datos (ej: datos crudos 90 días, agregados 5 años)
 * Implementa el TelemetryRepository del dominio.
 */

import { InfluxDB, Point, WriteApi, QueryApi } from '@influxdata/influxdb-client';
import { TelemetryReading } from '../../domain/entities/telemetry.entity';
import { TelemetryRepository } from '../../domain/repositories/telemetry.repository';

const INFLUX_URL = process.env.INFLUX_URL || 'http://localhost:8086';
const INFLUX_TOKEN = process.env.INFLUX_TOKEN || 'mediconnect-token';
const INFLUX_ORG = process.env.INFLUX_ORG || 'mediconnect';
const INFLUX_BUCKET = process.env.INFLUX_BUCKET || 'telemetry';

const client = new InfluxDB({ url: INFLUX_URL, token: INFLUX_TOKEN });
const writeApi: WriteApi = client.getWriteApi(INFLUX_ORG, INFLUX_BUCKET, 'ms');
const queryApi: QueryApi = client.getQueryApi(INFLUX_ORG);

export class InfluxTelemetryRepository implements TelemetryRepository {
  async save(reading: TelemetryReading): Promise<void> {
    const point = new Point('telemetry')
      .tag('patientId', reading.patientId)
      .tag('deviceId', reading.deviceId)
      .tag('metricType', reading.metricType)
      .timestamp(reading.recordedAt);

    // Manejar valores compuestos (presión arterial tiene sistólica y diastólica)
    if (typeof reading.value === 'object') {
      const bp = reading.value as { systolic: number; diastolic: number };
      point.floatField('systolic', bp.systolic);
      point.floatField('diastolic', bp.diastolic);
    } else {
      point.floatField('value', reading.value);
    }

    writeApi.writePoint(point);
    await writeApi.flush();
  }

  async findByPatientId(
    patientId: string,
    from: Date,
    to: Date
  ): Promise<TelemetryReading[]> {
    const query = `
      from(bucket: "${INFLUX_BUCKET}")
        |> range(start: ${from.toISOString()}, stop: ${to.toISOString()})
        |> filter(fn: (r) => r.patientId == "${patientId}")
    `;
    const rows: TelemetryReading[] = [];
    await queryApi.collectRows(query);
    return rows; // En producción: mapear rows a TelemetryReading
  }

  async findLatestByPatientId(patientId: string): Promise<TelemetryReading | null> {
    // Query Flux para obtener el último registro del paciente
    const query = `
      from(bucket: "${INFLUX_BUCKET}")
        |> range(start: -24h)
        |> filter(fn: (r) => r.patientId == "${patientId}")
        |> last()
    `;
    await queryApi.collectRows(query);
    return null; // En producción: mapear resultado
  }
}
