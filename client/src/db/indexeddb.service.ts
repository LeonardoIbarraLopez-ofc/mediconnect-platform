/**
 * Servicio IndexedDB — Estrategia Offline-First para Zonas Rurales
 * Según ESTRUCTURA.MD y FUNCIONAMIENTO.MD:
 * "El client/ utiliza IndexedDB: Caché de datos para acceso en campo."
 * Almacena localmente los registros clínicos del paciente para que los
 * técnicos en zonas rurales puedan consultar y registrar atenciones
 * sin conexión a internet. Los datos se sincronizan cuando la red vuelve.
 */

const DB_NAME = 'mediconnect-offline';
const DB_VERSION = 1;

interface OfflineRecord {
  id: string;
  type: 'appointment' | 'ehr' | 'prescription' | 'telemetry';
  data: object;
  synced: boolean;
  createdAt: string;
  updatedAt: string;
}

export class IndexedDBService {
  private db: IDBDatabase | null = null;

  async open(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store principal para registros clínicos offline
        if (!db.objectStoreNames.contains('records')) {
          const store = db.createObjectStore('records', { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('synced', 'synced', { unique: false });
        }

        // Store para el log de eventos pendientes de sincronización (Delta Sync)
        if (!db.objectStoreNames.contains('pendingEvents')) {
          const eventStore = db.createObjectStore('pendingEvents', { keyPath: 'id' });
          eventStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }

  async saveRecord(record: OfflineRecord): Promise<void> {
    if (!this.db) await this.open();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('records', 'readwrite');
      const store = tx.objectStore('records');
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getRecord(id: string): Promise<OfflineRecord | null> {
    if (!this.db) await this.open();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('records', 'readonly');
      const store = tx.objectStore('records');
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async getPendingRecords(): Promise<OfflineRecord[]> {
    if (!this.db) await this.open();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('records', 'readonly');
      const store = tx.objectStore('records');
      const index = store.index('synced');
      const req = index.getAll(IDBKeyRange.only(false));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async markSynced(id: string): Promise<void> {
    const record = await this.getRecord(id);
    if (record) {
      record.synced = true;
      record.updatedAt = new Date().toISOString();
      await this.saveRecord(record);
    }
  }
}
