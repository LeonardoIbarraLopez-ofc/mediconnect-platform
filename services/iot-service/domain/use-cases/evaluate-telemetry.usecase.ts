/**
 * Caso de Uso: Evaluar Dato de Telemetría
 * Recibe una lectura del dispositivo IoT (vía MQTT) y:
 * 1. Persiste la métrica en InfluxDB.
 * 2. Evalúa si la métrica supera los umbrales críticos del paciente.
 * 3. Si es crítica: publica 'alert.critical' en Kafka para que
 *    notification-service envíe SMS/Push al médico tratante inmediatamente.
 * 4. Si no es crítica: solo persiste para monitoreo histórico.
 */

import { TelemetryReading } from '../entities/telemetry.entity';
import { TelemetryRepository } from '../repositories/telemetry.repository';

interface EventPublisher {
  publish(topic: string, event: object): Promise<void>;
}

export class EvaluateTelemetryUseCase {
  constructor(
    private readonly repository: TelemetryRepository,
    private readonly eventPublisher: EventPublisher
  ) {}

  async execute(reading: TelemetryReading): Promise<void> {
    // Persistir siempre en InfluxDB independientemente del resultado
    await this.repository.save(reading);

    if (reading.isCritical()) {
      console.warn(
        `[IoT] ALERTA CRÍTICA: Paciente ${reading.patientId} | ${reading.metricType} = ${JSON.stringify(reading.value)}`
      );

      // Publicar alerta crítica para notification-service (SMS/Push inmediato)
      await this.eventPublisher.publish('alert.critical', {
        patientId: reading.patientId,
        deviceId: reading.deviceId,
        metricType: reading.metricType,
        value: reading.value,
        unit: reading.unit,
        recordedAt: reading.recordedAt.toISOString(),
        severity: 'CRITICAL',
        message: `Valor crítico detectado: ${reading.metricType} = ${JSON.stringify(reading.value)} ${reading.unit}`,
      });
    }
  }
}
