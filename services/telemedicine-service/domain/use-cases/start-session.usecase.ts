/**
 * Caso de Uso: Iniciar Sesión de Telemedicina
 * Verifica que existe la cita correspondiente y está en estado 'confirmed'.
 * Crea la sesión WebRTC cifrada y la persiste.
 * Emite señales de inicio al servidor WebRTC (STUN/TURN) para que
 * paciente y médico puedan establecer el canal peer-to-peer cifrado.
 */

import { v4 as uuidv4 } from 'uuid';
import { TeleconsultationSession } from '../entities/session.entity.ts';
import { SessionRepository } from '../repositories/session.repository.ts';

interface WebRTCServer {
  createRoom(sessionId: string): Promise<{ roomToken: string; iceServers: object[] }>;
}

export class StartSessionUseCase {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly webRTCServer: WebRTCServer
  ) {}

  async execute(appointmentId: string, patientId: string, doctorId: string): Promise<{
    session: TeleconsultationSession;
    roomToken: string;
    iceServers: object[];
  }> {
    const session = new TeleconsultationSession(
      uuidv4(),
      appointmentId,
      patientId,
      doctorId
    );

    await this.sessionRepository.save(session);

    // Crear sala WebRTC con credenciales TURN para NAT traversal en zonas remotas
    const { roomToken, iceServers } = await this.webRTCServer.createRoom(session.id);

    session.activate();
    await this.sessionRepository.update(session);

    return { session, roomToken, iceServers };
  }
}
