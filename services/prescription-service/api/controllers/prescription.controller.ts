/**
 * Controlador HTTP de Recetas Médicas
 * Endpoints:
 *   POST /prescriptions            — Emitir receta firmada digitalmente
 *   GET  /prescriptions/:id        — Obtener receta por ID
 *   GET  /prescriptions/patient/:patientId — Historial de recetas del paciente
 */

import { Request, Response } from 'express';
import { IssuePrescriptionUseCase } from '../../domain/use-cases/issue-prescription.usecase';
import { PostgresPrescriptionRepository } from '../../infrastructure/db/postgres.client';
import { RsaDigitalSignatureService } from '../../infrastructure/signing/digital-signature.service';
import { KafkaPrescriptionProducer } from '../../infrastructure/messaging/kafka.producer';

const repository = new PostgresPrescriptionRepository();
const signatureService = new RsaDigitalSignatureService();
const producer = new KafkaPrescriptionProducer();
const issueUseCase = new IssuePrescriptionUseCase(repository, signatureService, producer);

export async function issuePrescription(req: Request, res: Response): Promise<void> {
  try {
    const { patientId, doctorId, appointmentId, medications } = req.body;
    const prescription = await issueUseCase.execute({
      patientId,
      doctorId,
      appointmentId,
      medications,
    });
    res.status(201).json(prescription);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getPatientPrescriptions(req: Request, res: Response): Promise<void> {
  try {
    const prescriptions = await repository.findByPatientId(req.params.patientId);
    res.json(prescriptions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
