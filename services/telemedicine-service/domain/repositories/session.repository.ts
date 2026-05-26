/**
 * Interfaz del Repositorio de Sesiones de Telemedicina (Port)
 * Abstracción que desacopla el dominio del almacenamiento real.
 * Las grabaciones se almacenan en S3, pero los metadatos de sesión
 * (estado, URLs, timestamps) se guardan en una base de datos relacional.
 */

import { TeleconsultationSession } from '../entities/session.entity';

export interface SessionRepository {
  findById(id: string): Promise<TeleconsultationSession | null>;
  findByAppointmentId(appointmentId: string): Promise<TeleconsultationSession | null>;
  save(session: TeleconsultationSession): Promise<void>;
  update(session: TeleconsultationSession): Promise<void>;
}
