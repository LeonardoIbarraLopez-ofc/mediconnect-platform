/**
 * Suscriptor MQTT para Dispositivos IoT
 * Los dispositivos médicos (glucómetros, tensiómetros) publican métricas
 * vía protocolo MQTT al broker de MediConnect.
 * Este suscriptor consume esos mensajes y los envía al caso de uso
 * EvaluateTelemetryUseCase para persistencia y evaluación de alertas.
 *
 * Tópicos MQTT esperados:
 *   mediconnect/patients/{patientId}/devices/{deviceId}/glucose
 *   mediconnect/patients/{patientId}/devices/{deviceId}/blood_pressure
 *   mediconnect/patients/{patientId}/devices/{deviceId}/heart_rate
 */

import mqtt, { MqttClient } from 'mqtt';
import { v4 as uuidv4 } from 'uuid';
import { TelemetryReading } from '../../domain/entities/telemetry.entity';
import { EvaluateTelemetryUseCase } from '../../domain/use-cases/evaluate-telemetry.usecase';

const MQTT_BROKER = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
const TOPIC_PATTERN = 'mediconnect/patients/+/devices/+/+';

export class MqttIoTSubscriber {
  private client: MqttClient;

  constructor(private readonly evaluateUseCase: EvaluateTelemetryUseCase) {
    this.client = mqtt.connect(MQTT_BROKER, {
      clientId: 'iot-service',
      clean: true,
      reconnectPeriod: 5000, // reconectar cada 5s si se pierde la conexión
    });
  }

  start(): void {
    this.client.on('connect', () => {
      console.log('[MQTT] Conectado al broker IoT');
      this.client.subscribe(TOPIC_PATTERN, { qos: 1 });
    });

    this.client.on('message', async (topic: string, payload: Buffer) => {
      try {
        const parts = topic.split('/');
        const patientId = parts[2];
        const deviceId = parts[4];
        const metricType = parts[5] as TelemetryReading['metricType'];

        const rawValue = JSON.parse(payload.toString());

        const reading = new TelemetryReading(
          uuidv4(),
          patientId,
          deviceId,
          metricType,
          rawValue.value,
          rawValue.unit || this.getDefaultUnit(metricType)
        );

        await this.evaluateUseCase.execute(reading);
      } catch (error) {
        console.error('[MQTT] Error procesando mensaje:', error);
      }
    });

    this.client.on('error', (error) => {
      console.error('[MQTT] Error de conexión:', error);
    });
  }

  private getDefaultUnit(metricType: string): string {
    const units: Record<string, string> = {
      glucose: 'mg/dL',
      blood_pressure: 'mmHg',
      heart_rate: 'bpm',
      spo2: '%',
    };
    return units[metricType] || 'unknown';
  }
}
