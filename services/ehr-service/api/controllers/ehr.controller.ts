/**
 * Controlador HTTP del EHR Service
 * Endpoints:
 *   GET /ehr/patient/:patientId      — Historial completo del paciente
 *   GET /ehr/national-id/:nationalId — Búsqueda por cédula (integración legado)
 * Al consultar, el controlador dispara la fusión con el sistema COBOL
 * de forma transparente para el cliente (via el use case).
 */

import { Request, Response } from 'express';
import { GetPatientHistoryUseCase } from '../../domain/use-cases/get-patient-history.usecase';
import { MongoEhrRepository } from '../../infrastructure/db/mongo.client';
import { CobolLegacyAdapter } from '../../infrastructure/legacy-adapter/cobol-adapter';

const repository = new MongoEhrRepository();
const legacyAdapter = new CobolLegacyAdapter();
const getHistoryUseCase = new GetPatientHistoryUseCase(repository, legacyAdapter);

export async function getPatientHistory(req: Request, res: Response): Promise<void> {
  try {
    const { patientId } = req.params;
    const { nationalId } = req.query as { nationalId: string };

    if (!nationalId) {
      res.status(400).json({ error: 'nationalId (cédula) es requerido para consultar el legado' });
      return;
    }

    const history = await getHistoryUseCase.execute(patientId, nationalId);
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getHistoryByNationalId(req: Request, res: Response): Promise<void> {
  try {
    const { nationalId } = req.params;
    const history = await repository.findByNationalId(nationalId);
    if (!history) {
      res.status(404).json({ error: 'Historial no encontrado' });
      return;
    }
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
