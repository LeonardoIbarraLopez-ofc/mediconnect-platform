/**
 * Controlador HTTP de Sesiones de Telemedicina
 * Expone los endpoints para gestionar videoconsultas.
 * Endpoints:
 *   POST /sessions/start        — Iniciar sesión WebRTC (requiere appointmentId)
 *   POST /sessions/:id/end      — Finalizar sesión y subir grabación
 *   GET  /sessions/:id          — Obtener estado de sesión
 */

import { Request, Response } from 'express';
import { StartSessionUseCase } from '../../domain/use-cases/start-session.usecase.ts';
import { EndSessionUseCase } from '../../domain/use-cases/end-session.usecase.ts';
import { WebRTCServer } from '../../infrastructure/webrtc/webrtc.server.ts';
import { S3StorageService } from '../../infrastructure/storage/s3.client.ts';

const webRTCServer = new WebRTCServer();
const storageService = new S3StorageService();

// Los repositorios y producers se inyectarían desde index.ts
const startUseCase = new StartSessionUseCase({} as any, webRTCServer);
const endUseCase = new EndSessionUseCase({} as any, storageService, {} as any);

export async function startSession(req: Request, res: Response): Promise<void> {
  try {
    const { appointmentId, patientId, doctorId } = req.body;
    const result = await startUseCase.execute(appointmentId, patientId, doctorId);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function endSession(req: Request, res: Response): Promise<void> {
  try {
    const { clinicalSummary } = req.body;
    // En producción: el buffer de grabación viene como multipart/form-data
    const fakeBuffer = Buffer.from('recording-data');
    await endUseCase.execute(req.params.id, fakeBuffer, clinicalSummary);
    res.json({ message: 'Sesión finalizada y grabación guardada' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
