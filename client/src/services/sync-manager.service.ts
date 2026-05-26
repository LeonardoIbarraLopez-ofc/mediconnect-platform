/**
 * SyncManager — Sincronización Offline-First
 * Según ESTRUCTURA.MD: "SyncManager: Servicio que detecta navigator.onLine
 * y re-sincroniza las transacciones pendientes mediante un log de eventos (Delta Sync)."
 * Según FUNCIONAMIENTO.MD: "Conflict Resolution: Utiliza una estrategia de
 * 'Last Write Wins' basada en el timestamp del evento."
 *
 * Flujo de sincronización:
 * 1. Detecta evento 'online' del navegador.
 * 2. Lee los registros no sincronizados de IndexedDB.
 * 3. Los envía al API Gateway en orden cronológico (Delta Sync).
 * 4. En conflicto: gana el registro con timestamp más reciente (LWW).
 * 5. Marca los registros como sincronizados al confirmar 2xx del servidor.
 */

import { IndexedDBService } from '../db/indexeddb.service';

// @ts-ignore
const API_BASE_URL = 'http://localhost:3000/api/v1';

export class SyncManager {
  private isSyncing = false;

  constructor(private readonly db: IndexedDBService) {}

  initialize(): void {
    // Escuchar el evento online del navegador para iniciar sincronización
    window.addEventListener('online', () => {
      console.log('[SyncManager] Conexión restaurada. Iniciando sincronización...');
      this.syncPendingRecords();
    });

    window.addEventListener('offline', () => {
      console.log('[SyncManager] Sin conexión. Modo offline activo.');
    });

    // Sincronizar también al cargar si hay conexión
    if (navigator.onLine) {
      this.syncPendingRecords();
    }
  }

  async syncPendingRecords(): Promise<void> {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      const pendingRecords = await this.db.getPendingRecords();

      if (pendingRecords.length === 0) {
        console.log('[SyncManager] No hay registros pendientes de sincronización.');
        return;
      }

      console.log(`[SyncManager] Sincronizando ${pendingRecords.length} registros...`);

      // Ordenar por createdAt para Delta Sync cronológico
      const sorted = pendingRecords.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      for (const record of sorted) {
        try {
          await this.syncRecord(record);
          await this.db.markSynced(record.id);
          console.log(`[SyncManager] Registro ${record.id} sincronizado exitosamente.`);
        } catch (error) {
          console.error(`[SyncManager] Error sincronizando ${record.id}:`, error);
          // Continuar con el siguiente registro (best-effort)
        }
      }
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncRecord(record: { id: string; type: string; data: object; updatedAt: string }): Promise<void> {
    const endpointMap: Record<string, string> = {
      appointment: '/appointments',
      ehr: '/ehr',
      prescription: '/prescriptions',
      telemetry: '/iot',
    };

    const endpoint = endpointMap[record.type];
    if (!endpoint) return;

    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}${endpoint}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        // Header especial para que el servidor aplique LWW conflict resolution
        'X-Client-Timestamp': record.updatedAt,
      },
      body: JSON.stringify(record.data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
  }

  isOnline(): boolean {
    return navigator.onLine;
  }
}
