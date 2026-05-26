/**
 * Punto de Entrada del API Gateway
 * Inicializa el servidor Express, registra los middlewares globales
 * (CORS, body-parser, logging) y monta el enrutador principal.
 * Es el único punto de entrada al sistema desde el exterior:
 * todos los clientes (PWA, móvil, terceros) deben pasar por aquí.
 */

import express from 'express';
import cors from 'cors';
import router from './routes/index';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check sin autenticación para los probes de Kubernetes/Docker
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'api-gateway', timestamp: new Date().toISOString() });
});

// Todas las rutas de API pasan por el enrutador con auth + rate-limit
app.use('/api/v1', router);

app.listen(PORT, () => {
  console.log(`[API Gateway] Escuchando en puerto ${PORT}`);
});

export default app;
