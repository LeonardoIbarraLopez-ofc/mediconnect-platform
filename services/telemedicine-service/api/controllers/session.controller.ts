/**
 * Controlador HTTP de Sesiones de Telemedicina
 * Expone los endpoints para gestionar videoconsultas.
 * Endpoints:
 *   POST /sessions/start        — Iniciar sesión WebRTC (requiere appointmentId)
 *   POST /sessions/:id/end      — Finalizar sesión y subir grabación
 *   GET  /sessions/:id          — Obtener estado de sesión
 */

import { Request, Response } from 'express';
import { StartSessionUseCase } from '../../domain/use-cases/start-session.usecase';
import { EndSessionUseCase } from '../../domain/use-cases/end-session.usecase';
import { WebRTCServer } from '../../infrastructure/webrtc/webrtc.server';
import { S3StorageService } from '../../infrastructure/storage/s3.client';

import { SessionRepository } from '../../domain/repositories/session.repository';
import { TeleconsultationSession } from '../../domain/entities/session.entity';

class InMemorySessionRepository implements SessionRepository {
  private sessions = new Map<string, TeleconsultationSession>();

  async findById(id: string): Promise<TeleconsultationSession | null> {
    return this.sessions.get(id) || null;
  }

  async findByAppointmentId(appointmentId: string): Promise<TeleconsultationSession | null> {
    for (const session of this.sessions.values()) {
      if (session.appointmentId === appointmentId) return session;
    }
    return null;
  }

  async save(session: TeleconsultationSession): Promise<void> {
    this.sessions.set(session.id, session);
  }

  async update(session: TeleconsultationSession): Promise<void> {
    this.sessions.set(session.id, session);
  }
}

class ConsoleEventPublisher {
  async publish(topic: string, event: object): Promise<void> {
    console.log(`[EventPublisher - Standalone] Publicando evento en ${topic}:`, event);
  }
}

const sessionRepository = new InMemorySessionRepository();
const eventPublisher = new ConsoleEventPublisher();
const webRTCServer = new WebRTCServer();
const storageService = new S3StorageService();

// Los repositorios y producers se inyectan correctamente para evitar excepciones
const startUseCase = new StartSessionUseCase(sessionRepository, webRTCServer);
const endUseCase = new EndSessionUseCase(sessionRepository, storageService, eventPublisher);

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
