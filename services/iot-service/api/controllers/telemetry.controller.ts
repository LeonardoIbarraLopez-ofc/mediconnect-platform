/**
 * Controlador HTTP de Telemetría IoT
 * La ingesta principal es por MQTT (mqtt.subscriber.ts), pero este controlador
 * permite consultar el historial de métricas de un paciente via HTTP.
 * Endpoints:
 *   GET /telemetry/patient/:patientId?from=&to= — Métricas en rango de fechas
 *   GET /telemetry/patient/:patientId/latest    — Última lectura del paciente
 */

import { Request, Response } from 'express';
import { InfluxTelemetryRepository } from '../../infrastructure/db/influxdb.client';

const repository = new InfluxTelemetryRepository();

export async function getPatientTelemetry(req: Request, res: Response): Promise<void> {
  try {
    const { patientId } = req.params;
    const from = new Date(req.query.from as string || Date.now() - 7 * 24 * 3600 * 1000);
    const to = new Date(req.query.to as string || Date.now());

    const readings = await repository.findByPatientId(patientId, from, to);
    res.json(readings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getLatestTelemetry(req: Request, res: Response): Promise<void> {
  try {
    const reading = await repository.findLatestByPatientId(req.params.patientId);
    if (!reading) {
      res.status(404).json({ error: 'No hay lecturas recientes para este paciente' });
      return;
    }
    res.json(reading);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
