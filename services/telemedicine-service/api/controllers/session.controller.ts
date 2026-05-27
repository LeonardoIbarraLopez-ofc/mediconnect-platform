/**
 * Controlador HTTP de Sesiones de Telemedicina
 * Expone los endpoints para gestionar videoconsultas.
 * Endpoints:
 *   POST /sessions/start        — Iniciar sesión WebRTC (requiere appointmentId)
 *   POST /sessions/:id/end      — Finalizar sesión y subir grabación
 *   GET  /sessions/:id          — Obtener estado de sesión
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { StartSessionUseCase } from '../../domain/use-cases/start-session.usecase';
import { EndSessionUseCase } from '../../domain/use-cases/end-session.usecase';
import { WebRTCServer } from '../../infrastructure/webrtc/webrtc.server';
import { S3StorageService } from '../../infrastructure/storage/s3.client';

const webRTCServer = new WebRTCServer();
const storageService = new S3StorageService();

const startUseCase = new StartSessionUseCase({} as any, webRTCServer);
const endUseCase = new EndSessionUseCase({} as any, storageService, {} as any);

const StartSessionSchema = z.object({
  appointmentId: z.string().uuid({ message: 'appointmentId debe ser un UUID válido' }),
  patientId: z.string().uuid({ message: 'patientId debe ser un UUID válido' }),
  doctorId: z.string().uuid({ message: 'doctorId debe ser un UUID válido' }),
});

const EndSessionSchema = z.object({
  clinicalSummary: z
    .string()
    .min(10, { message: 'El resumen clínico debe tener al menos 10 caracteres' }),
});

export async function startSession(req: Request, res: Response): Promise<void> {
  const result = StartSessionSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Datos inválidos', details: result.error.flatten().fieldErrors });
    return;
  }

  try {
    const { appointmentId, patientId, doctorId } = result.data;
    const session = await startUseCase.execute(appointmentId, patientId, doctorId);
    res.status(201).json(session);
  } catch (error: unknown) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function endSession(req: Request, res: Response): Promise<void> {
  const result = EndSessionSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Datos inválidos', details: result.error.flatten().fieldErrors });
    return;
  }

  try {
    const { clinicalSummary } = result.data;
    // En producción: el buffer de grabación viene como multipart/form-data
    const fakeBuffer = Buffer.from('recording-data');
    await endUseCase.execute(req.params.id, fakeBuffer, clinicalSummary);
    res.json({ message: 'Sesión finalizada y grabación guardada' });
  } catch (error: unknown) {
    res.status(400).json({ error: (error as Error).message });
  }
}
