/**
 * Cliente MongoDB para EHR Service
 * MongoDB fue elegido para el historial clínico por su esquema flexible (BSON),
 * que permite almacenar registros heterogéneos (consultas, labs, recetas, imágenes)
 * sin migración de esquema. Además, su Document Model es natural para el
 * historial clínico que es esencialmente una lista de registros anidados.
 * Implementa el EhrRepository del dominio.
 */

import { MongoClient, Db, Collection } from 'mongodb';
import { PatientHistory, ClinicalRecord } from '../../domain/entities/patient-history.entity';
import { EhrRepository } from '../../domain/repositories/ehr.repository';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = 'ehr_db';

let db: Db;

async function getDb(): Promise<Db> {
  if (!db) {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('[MongoDB] Conectado a ehr_db');
  }
  return db;
}

function getCollection(): Promise<Collection> {
  return getDb().then((d) => d.collection('patient_histories'));
}

function docToEntity(doc: any): PatientHistory {
  return new PatientHistory(
    doc.patientId,
    doc.nationalId,
    doc.records as ClinicalRecord[],
    new Date(doc.createdAt),
    doc.lastSyncedAt ? new Date(doc.lastSyncedAt) : undefined
  );
}

export class MongoEhrRepository implements EhrRepository {
  async findByPatientId(patientId: string): Promise<PatientHistory | null> {
    const col = await getCollection();
    const doc = await col.findOne({ patientId });
    return doc ? docToEntity(doc) : null;
  }

  async findByNationalId(nationalId: string): Promise<PatientHistory | null> {
    const col = await getCollection();
    const doc = await col.findOne({ nationalId });
    return doc ? docToEntity(doc) : null;
  }

  async save(history: PatientHistory): Promise<void> {
    const col = await getCollection();
    await col.updateOne(
      { patientId: history.patientId },
      { $set: { ...history } },
      { upsert: true }
    );
  }

  async update(history: PatientHistory): Promise<void> {
    const col = await getCollection();
    await col.updateOne({ patientId: history.patientId }, { $set: { ...history } });
  }
}
