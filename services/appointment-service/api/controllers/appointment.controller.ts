/**
 * Controlador HTTP de Citas Médicas
 * Expone los endpoints REST del appointment-service.
 * Traduce los requests HTTP a llamadas a los casos de uso del dominio.
 * Maneja los errores de dominio convirtiéndolos en respuestas HTTP apropiadas.
 * No contiene lógica de negocio: solo orquesta y traduce (Clean Architecture).
 *
 * Endpoints:
 *   POST   /appointments          — Crear nueva cita
 *   GET    /appointments/:id      — Obtener cita por ID
 *   GET    /appointments/patient/:patientId — Citas de un paciente
 *   PATCH  /appointments/:id/status — Cambiar estado
 */

import { Request, Response } from 'express';
import { CreateAppointmentUseCase } from '../../domain/use-cases/create-appointment.usecase';
import { UpdateAppointmentStatusUseCase } from '../../domain/use-cases/update-appointment-status.usecase';
import { PostgresAppointmentRepository } from '../../infrastructure/db/postgres.client';
import { KafkaAppointmentProducer } from '../../infrastructure/messaging/kafka.producer';

const repository = new PostgresAppointmentRepository();
const producer = new KafkaAppointmentProducer();
const createUseCase = new CreateAppointmentUseCase(repository, producer);
const updateStatusUseCase = new UpdateAppointmentStatusUseCase(repository, producer);

export async function createAppointment(req: Request, res: Response): Promise<void> {
  try {
    const { patientId, doctorId, scheduledAt, specialty } = req.body;
    const appointment = await createUseCase.execute({
      patientId,
      doctorId,
      scheduledAt: new Date(scheduledAt),
      specialty,
    });
    res.status(201).json(appointment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getAppointment(req: Request, res: Response): Promise<void> {
  try {
    const appointment = await repository.findById(req.params.id);
    if (!appointment) {
      res.status(404).json({ error: 'Cita no encontrada' });
      return;
    }
    res.json(appointment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getPatientAppointments(req: Request, res: Response): Promise<void> {
  try {
    const appointments = await repository.findByPatientId(req.params.patientId);
    res.json(appointments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateAppointmentStatus(req: Request, res: Response): Promise<void> {
  try {
    const { status, notes } = req.body;
    const appointment = await updateStatusUseCase.execute(req.params.id, status, notes);
    res.json(appointment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
