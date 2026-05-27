/**
 * Controlador HTTP de Recetas Médicas
 * Endpoints:
 *   POST /prescriptions            — Emitir receta firmada digitalmente
 *   GET  /prescriptions/:id        — Obtener receta por ID
 *   GET  /prescriptions/patient/:patientId — Historial de recetas del paciente
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { IssuePrescriptionUseCase } from '../../domain/use-cases/issue-prescription.usecase';
import { PostgresPrescriptionRepository } from '../../infrastructure/db/postgres.client';
import { RsaDigitalSignatureService } from '../../infrastructure/signing/digital-signature.service';
import { KafkaPrescriptionProducer } from '../../infrastructure/messaging/kafka.producer';

const repository = new PostgresPrescriptionRepository();
const signatureService = new RsaDigitalSignatureService();
const producer = new KafkaPrescriptionProducer();
const issueUseCase = new IssuePrescriptionUseCase(repository, signatureService, producer);

const MedicationSchema = z.object({
  name: z.string().min(1, { message: 'El nombre del medicamento es requerido' }),
  dosage: z.string().min(1, { message: 'La dosis es requerida' }),
  frequency: z.string().min(1, { message: 'La frecuencia es requerida' }),
  durationDays: z
    .number({ invalid_type_error: 'durationDays debe ser un número' })
    .int()
    .positive({ message: 'durationDays debe ser un entero positivo' }),
  instructions: z.string().optional(),
});

const IssuePrescriptionSchema = z.object({
  patientId: z.string().uuid({ message: 'patientId debe ser un UUID válido' }),
  doctorId: z.string().uuid({ message: 'doctorId debe ser un UUID válido' }),
  appointmentId: z.string().uuid({ message: 'appointmentId debe ser un UUID válido' }),
  medications: z
    .array(MedicationSchema)
    .min(1, { message: 'Se requiere al menos un medicamento' }),
});

export async function issuePrescription(req: Request, res: Response): Promise<void> {
  const result = IssuePrescriptionSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Datos inválidos', details: result.error.flatten().fieldErrors });
    return;
  }

  try {
    const prescription = await issueUseCase.execute(result.data);
    res.status(201).json(prescription);
  } catch (error: unknown) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getPrescription(req: Request, res: Response): Promise<void> {
  try {
    const prescription = await repository.findById(req.params.id);
    if (!prescription) {
      res.status(404).json({ error: 'Receta no encontrada' });
      return;
    }
    res.json(prescription);
  } catch (error: unknown) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export async function getPatientPrescriptions(req: Request, res: Response): Promise<void> {
  try {
    const prescriptions = await repository.findByPatientId(req.params.patientId);
    res.json(prescriptions);
  } catch (error: unknown) {
    res.status(500).json({ error: (error as Error).message });
  }
}
