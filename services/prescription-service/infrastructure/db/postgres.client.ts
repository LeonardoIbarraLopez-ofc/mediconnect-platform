/**
 * Cliente PostgreSQL para Prescription Service
 * Almacena recetas firmadas digitalmente. PostgreSQL garantiza consistencia
 * transaccional al guardar la receta y encolar el evento Kafka juntos
 * (patrón Outbox para exactly-once delivery).
 */

import { Pool } from 'pg';
import { Prescription, PrescriptionStatus } from '../../domain/entities/prescription.entity';
import { PrescriptionRepository } from '../../domain/repositories/prescription.repository';

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'prescriptions_db',
  user: process.env.POSTGRES_USER || 'mediconnect',
  password: process.env.POSTGRES_PASSWORD || 'secret',
});

function rowToPrescription(row: any): Prescription {
  const p = new Prescription(
    row.id,
    row.patient_id,
    row.doctor_id,
    row.appointment_id,
    JSON.parse(row.medications),
    row.status as PrescriptionStatus,
    new Date(row.created_at)
  );
  p.digitalSignature = row.digital_signature;
  if (row.signed_at) p.signedAt = new Date(row.signed_at);
  if (row.dispensed_at) p.dispensedAt = new Date(row.dispensed_at);
  return p;
}

export class PostgresPrescriptionRepository implements PrescriptionRepository {
  async findById(id: string): Promise<Prescription | null> {
    const result = await pool.query('SELECT * FROM prescriptions WHERE id = $1', [id]);
    return result.rows[0] ? rowToPrescription(result.rows[0]) : null;
  }

  async findByPatientId(patientId: string): Promise<Prescription[]> {
    const result = await pool.query(
      'SELECT * FROM prescriptions WHERE patient_id = $1 ORDER BY created_at DESC',
      [patientId]
    );
    return result.rows.map(rowToPrescription);
  }

  async findByAppointmentId(appointmentId: string): Promise<Prescription | null> {
    const result = await pool.query(
      'SELECT * FROM prescriptions WHERE appointment_id = $1',
      [appointmentId]
    );
    return result.rows[0] ? rowToPrescription(result.rows[0]) : null;
  }

  async save(prescription: Prescription): Promise<void> {
    await pool.query(
      `INSERT INTO prescriptions
       (id, patient_id, doctor_id, appointment_id, medications, status, digital_signature, signed_at, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        prescription.id,
        prescription.patientId,
        prescription.doctorId,
        prescription.appointmentId,
        JSON.stringify(prescription.medications),
        prescription.status,
        prescription.digitalSignature,
        prescription.signedAt,
        prescription.createdAt,
      ]
    );
  }

  async update(prescription: Prescription): Promise<void> {
    await pool.query(
      'UPDATE prescriptions SET status = $1, dispensed_at = $2 WHERE id = $3',
      [prescription.status, prescription.dispensedAt, prescription.id]
    );
  }
}
