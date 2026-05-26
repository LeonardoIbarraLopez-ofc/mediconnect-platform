/**
 * Caso de Uso: Emitir Receta Médica con Firma Digital
 * Flujo completo según FUNCIONAMIENTO.MD:
 * 1. El médico crea la receta con los medicamentos.
 * 2. El servicio de firma digital genera la firma RSA del médico.
 * 3. La receta se persiste firmada en PostgreSQL.
 * 4. Se publica prescription.issued en Kafka → tópico 'prescriptions.issued'
 *    para que pharmacy-service tome la orden automáticamente.
 * 5. El audit-service captura el evento para el Ledger inmutable.
 */

import { v4 as uuidv4 } from 'uuid';
import { Prescription, PrescribedMedication } from '../entities/prescription.entity';
import { PrescriptionRepository } from '../repositories/prescription.repository';

interface DigitalSignatureService {
  sign(data: string, doctorId: string): Promise<string>;
}

interface EventPublisher {
  publish(topic: string, event: object): Promise<void>;
}

interface IssuePrescriptionInput {
  patientId: string;
  doctorId: string;
  appointmentId: string;
  medications: PrescribedMedication[];
}

export class IssuePrescriptionUseCase {
  constructor(
    private readonly repository: PrescriptionRepository,
    private readonly signatureService: DigitalSignatureService,
    private readonly eventPublisher: EventPublisher
  ) {}

  async execute(input: IssuePrescriptionInput): Promise<Prescription> {
    const prescription = new Prescription(
      uuidv4(),
      input.patientId,
      input.doctorId,
      input.appointmentId,
      input.medications
    );

    // Generar firma digital del médico sobre el contenido de la receta
    const contentToSign = JSON.stringify({
      prescriptionId: prescription.id,
      patientId: prescription.patientId,
      medications: prescription.medications,
      createdAt: prescription.createdAt,
    });

    const signature = await this.signatureService.sign(contentToSign, input.doctorId);
    prescription.sign(signature);

    await this.repository.save(prescription);

    // Publicar en 'prescriptions.issued' para pharmacy-service (según FUNCIONAMIENTO.MD)
    await this.eventPublisher.publish('prescriptions.issued', {
      prescriptionId: prescription.id,
      patientId: prescription.patientId,
      doctorId: prescription.doctorId,
      medications: prescription.medications,
      digitalSignature: prescription.digitalSignature,
      timestamp: new Date().toISOString(),
    });

    return prescription;
  }
}
