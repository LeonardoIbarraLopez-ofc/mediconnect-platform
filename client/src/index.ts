/**
 * Punto de Entrada del Cliente PWA (Progressive Web App)
 * Inicializa la aplicación web offline-first de MediConnect.
 * Registra el Service Worker para habilitar capacidades offline
 * y cacheo de assets para uso en zonas rurales con conectividad limitada.
 * También inicializa el SyncManager para la sincronización automática.
 */

import { SyncManager } from './services/sync-manager.service';
import { IndexedDBService } from './db/indexeddb.service';

// Inicializar servicios offline-first
const db = new IndexedDBService();
const syncManager = new SyncManager(db);

async function bootstrap(): Promise<void> {
  // Abrir la base de datos IndexedDB
  await db.open();

  // Iniciar el gestor de sincronización
  syncManager.initialize();

  // Registrar Service Worker para capacidades PWA (offline + push notifications)
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('[PWA] Service Worker registrado:', registration.scope);
    } catch (error) {
      console.error('[PWA] Error al registrar Service Worker:', error);
    }
  }

  console.log('[MediConnect PWA] Aplicación iniciada. Modo offline-first activo.');
}

bootstrap().catch(console.error);
