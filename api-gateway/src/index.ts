/**
 * Punto de Entrada del API Gateway
 * Inicializa el servidor Express, registra los middlewares globales
 * (CORS, body-parser, logging estructurado) y monta el enrutador principal.
 * Es el único punto de entrada al sistema desde el exterior:
 * todos los clientes (PWA, móvil, terceros) deben pasar por aquí.
 */

import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { logger } from './logger';
import router from './routes/index';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

// Health check sin autenticación para los probes de Kubernetes/Docker
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'api-gateway', timestamp: new Date().toISOString() });
});

// Todas las rutas de API pasan por el enrutador con auth + rate-limit
app.use('/api/v1', router);

app.listen(PORT, () => {
  logger.info({ port: PORT }, '[API Gateway] Escuchando en puerto');
});

export default app;
