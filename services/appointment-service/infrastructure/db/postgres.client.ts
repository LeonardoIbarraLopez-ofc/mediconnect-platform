/**
 * Cliente PostgreSQL para Appointment Service
 * Implementa el AppointmentRepository usando PostgreSQL como persistencia.
 * PostgreSQL fue elegido para citas por su soporte transaccional ACID,
 * que garantiza consistencia al reservar horarios médicos concurrentemente.
 * Usa la librería 'pg' con pool de conexiones para eficiencia en producción.
 */

import { Pool } from 'pg';
import { Appointment, AppointmentStatus } from '../../domain/entities/appointment.entity.ts';
import { AppointmentRepository } from '../../domain/repositories/appointment.repository.ts';

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
  async findById(id: string): Promise<Appointment | null> {
    const result = await pool.query('SELECT * FROM appointments WHERE id = $1', [id]);
    return result.rows[0] ? rowToAppointment(result.rows[0]) : null;
  }

  async findByPatientId(patientId: string): Promise<Appointment[]> {
    const result = await pool.query(
      'SELECT * FROM appointments WHERE patient_id = $1 ORDER BY scheduled_at',
      [patientId]
    );
    return result.rows.map(rowToAppointment);
  }

  async findByDoctorId(doctorId: string, date: Date): Promise<Appointment[]> {
    const result = await pool.query(
      `SELECT * FROM appointments
       WHERE doctor_id = $1
         AND scheduled_at::date = $2::date
         AND status != 'cancelled'`,
      [doctorId, date]
    );
    return result.rows.map(rowToAppointment);
  }

  async save(appointment: Appointment): Promise<void> {
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
  }

  async update(appointment: Appointment): Promise<void> {
    await pool.query(
      `UPDATE appointments SET status = $1, notes = $2 WHERE id = $3`,
      [appointment.status, appointment.notes, appointment.id]
    );
  }

  async delete(id: string): Promise<void> {
    await pool.query('DELETE FROM appointments WHERE id = $1', [id]);
  }
}
