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
      reconnectPeriod: 15000, // reconectar cada 15s si se pierde la conexión (más espaciado para no llenar logs)
    });
  }

  start(): void {
    let isConnected = false;
    let simInterval: NodeJS.Timeout | null = null;

    const startSimulation = () => {
      if (simInterval) return;
      console.log('[IoT-Simulator] Iniciando simulador de dispositivos médicos en segundo plano (modo contingencia).');
      simInterval = setInterval(async () => {
        if (isConnected) {
          console.log('[IoT-Simulator] Broker real conectado. Apagando simulador local.');
          if (simInterval) {
            clearInterval(simInterval);
            simInterval = null;
          }
          return;
        }

        const mockPatientId = `pat-${100 + Math.floor(Math.random() * 5)}`;
        const deviceId = `dev-iot-${Math.floor(1000 + Math.random() * 9000)}`;
        const metricTypes: ('glucose' | 'blood_pressure' | 'heart_rate' | 'spo2')[] = ['glucose', 'blood_pressure', 'heart_rate', 'spo2'];
        const metricType = metricTypes[Math.floor(Math.random() * metricTypes.length)];

        let value: any;
        let unit: string = 'unknown';

        if (metricType === 'glucose') {
          value = 75 + Math.floor(Math.random() * 120); // 75 a 195 mg/dL (glucómetro)
          unit = 'mg/dL';
        } else if (metricType === 'blood_pressure') {
          const isCritical = Math.random() < 0.3;
          const systolic = isCritical ? 142 + Math.floor(Math.random() * 18) : 115 + Math.floor(Math.random() * 15);
          const diastolic = 75 + Math.floor(Math.random() * 12);
          value = { systolic, diastolic };
          unit = 'mmHg';
        } else if (metricType === 'heart_rate') {
          value = 65 + Math.floor(Math.random() * 30); // 65 a 95 bpm
          unit = 'bpm';
        } else if (metricType === 'spo2') {
          value = 93 + Math.floor(Math.random() * 7); // 93% a 100% de saturación de oxígeno
          unit = '%';
        }

        const reading = new TelemetryReading(
          uuidv4(),
          mockPatientId,
          deviceId,
          metricType,
          value,
          unit
        );

        try {
          await this.evaluateUseCase.execute(reading);
        } catch (err: any) {
          // Ignorar errores en simulación
        }
      }, 6000); // Generar métrica cada 6 segundos
    };

    this.client.on('connect', () => {
      isConnected = true;
      if (simInterval) {
        console.log('[IoT-Simulator] Desactivando simulador por conexión exitosa al Broker.');
        clearInterval(simInterval);
        simInterval = null;
      }
      console.log('[MQTT] Conectado al broker IoT real');
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

    this.client.on('error', (error: any) => {
      console.warn(`[MQTT] Estado: Sin conexión al broker real (${error.message || error}).`);
      if (!isConnected) {
        startSimulation();
      }
    });

    // Arrancar simulación de contingencia tras 3 segundos si no hay broker levantado
    setTimeout(() => {
      if (!isConnected) {
        startSimulation();
      }
    }, 3000);
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
