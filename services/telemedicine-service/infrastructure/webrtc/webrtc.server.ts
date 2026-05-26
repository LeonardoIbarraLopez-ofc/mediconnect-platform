/**
 * Servidor WebRTC para Telemedicina
 * Gestiona la señalización para establecer canales P2P cifrados entre
 * paciente y médico. Configura servidores STUN (Google) y TURN propios
 * para garantizar conectividad en zonas rurales con NAT restrictivo.
 * Las grabaciones se hacen server-side para cumplimiento legal y
 * posterior almacenamiento cifrado en S3.
 */

export interface WebRTCRoomConfig {
  roomToken: string;
  iceServers: RTCIceServer[];
}

export class WebRTCServer {
  private readonly stunServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ];

  private readonly turnServer = {
    urls: process.env.TURN_SERVER_URL || 'turn:turn.mediconnect.bo:3478',
    username: process.env.TURN_USERNAME || 'mediconnect',
    credential: process.env.TURN_CREDENTIAL || 'secret',
  };

  async createRoom(sessionId: string): Promise<WebRTCRoomConfig> {
    // En producción: generar token JWT con tiempo de vida limitado (30 min)
    // vinculado al sessionId para evitar acceso no autorizado a la sala
    const roomToken = Buffer.from(`${sessionId}:${Date.now()}`).toString('base64');

    console.log(`[WebRTC] Sala creada para sesión ${sessionId}`);

    return {
      roomToken,
      iceServers: [
        ...this.stunServers,
        this.turnServer,
      ],
    };
  }

  async closeRoom(sessionId: string): Promise<void> {
    // En producción: invalidar el token y limpiar recursos del servidor de señalización
    console.log(`[WebRTC] Sala cerrada para sesión ${sessionId}`);
  }
}
