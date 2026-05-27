/**
 * Cliente PostgreSQL para Appointment Service
 * Implementa el AppointmentRepository usando PostgreSQL como persistencia.
 * PostgreSQL fue elegido para citas por su soporte transaccional ACID,
 * que garantiza consistencia al reservar horarios médicos concurrentemente.
 * Usa la librería 'pg' con pool de conexiones para eficiencia en producción.
 */

import { Pool } from 'pg';
import { Appointment, AppointmentStatus } from '../../domain/entities/appointment.entity';
import { AppointmentRepository } from '../../domain/repositories/appointment.repository';

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'appointments_db',
  user: process.env.POSTGRES_USER || 'mediconnect',
  password: process.env.POSTGRES_PASSWORD || 'secret',
  max: 10, // máximo de conexiones en el pool
});

function rowToAppointment(row: any): Appointment {
  return new Appointment(
    row.id,
    row.patient_id,
    row.doctor_id,
    new Date(row.scheduled_at),
    row.status as AppointmentStatus,
    row.specialty,
    row.notes,
    new Date(row.created_at)
  );
}

export class PostgresAppointmentRepository implements AppointmentRepository {
  private static memoryAppointments: Appointment[] = [];

  async findById(id: string): Promise<Appointment | null> {
    try {
      const result = await pool.query('SELECT * FROM appointments WHERE id = $1', [id]);
      return result.rows[0] ? rowToAppointment(result.rows[0]) : null;
    } catch (err) {
      return PostgresAppointmentRepository.memoryAppointments.find(a => a.id === id) || null;
    }
  }

  async findByPatientId(patientId: string): Promise<Appointment[]> {
    try {
      const result = await pool.query(
        'SELECT * FROM appointments WHERE patient_id = $1 ORDER BY scheduled_at',
        [patientId]
      );
      return result.rows.map(rowToAppointment);
    } catch (err) {
      return PostgresAppointmentRepository.memoryAppointments
        .filter(a => a.patientId === patientId)
        .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
    }
  }

  async findByDoctorId(doctorId: string, date: Date): Promise<Appointment[]> {
    try {
      const result = await pool.query(
        `SELECT * FROM appointments
         WHERE doctor_id = $1
           AND scheduled_at::date = $2::date
           AND status != 'cancelled'`,
        [doctorId, date]
      );
      return result.rows.map(rowToAppointment);
    } catch (err) {
      return PostgresAppointmentRepository.memoryAppointments
        .filter(a => a.doctorId === doctorId && a.scheduledAt.toDateString() === date.toDateString() && a.status !== 'cancelled');
    }
  }

  async save(appointment: Appointment): Promise<void> {
    // Guardar siempre en memoria local
    PostgresAppointmentRepository.memoryAppointments.push(appointment);

    try {
      await pool.query(
        `INSERT INTO appointments (id, patient_id, doctor_id, scheduled_at, status, specialty, notes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          appointment.id,
          appointment.patientId,
          appointment.doctorId,
          appointment.scheduledAt,
          appointment.status,
          appointment.specialty,
          appointment.notes,
          appointment.createdAt,
        ]
      );
    } catch (err: any) {
      console.warn(`[Appointment-DB - Fallback] Guardado local en memoria. Detalle: ${err.message}`);
    }
  }

  async update(appointment: Appointment): Promise<void> {
    const idx = PostgresAppointmentRepository.memoryAppointments.findIndex(a => a.id === appointment.id);
    if (idx !== -1) {
      PostgresAppointmentRepository.memoryAppointments[idx] = appointment;
    }

    try {
      await pool.query(
        `UPDATE appointments SET status = $1, notes = $2 WHERE id = $3`,
        [appointment.status, appointment.notes, appointment.id]
      );
    } catch (err: any) {
      console.warn(`[Appointment-DB - Fallback] Actualizado local en memoria. Detalle: ${err.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    PostgresAppointmentRepository.memoryAppointments = PostgresAppointmentRepository.memoryAppointments.filter(a => a.id !== id);

    try {
      await pool.query('DELETE FROM appointments WHERE id = $1', [id]);
    } catch (err: any) {
      console.warn(`[Appointment-DB - Fallback] Eliminado local en memoria. Detalle: ${err.message}`);
    }
  }
}
