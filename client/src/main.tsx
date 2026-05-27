import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { IndexedDBService } from './db/indexeddb.service';
import { SyncManager } from './services/sync-manager.service';

// Initialize offline PWA services (IndexedDB + SyncManager)
const db = new IndexedDBService();
const syncManager = new SyncManager(db);

async function bootstrap() {
  try {
    await db.open();
    syncManager.initialize();
    console.log('[PWA] IndexedDB y SyncManager inicializados correctamente.');
  } catch (error) {
    console.error('[PWA] Error al inicializar los servicios offline-first:', error);
  }

  // Register service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.ts', {
          type: 'module'
        });
        console.log('[PWA] Service Worker registrado exitosamente en ámbito:', registration.scope);
      } catch (error) {
        console.error('[PWA] Error al registrar el Service Worker:', error);
      }
    });
  }
}

bootstrap();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
