/**
 * Enrutador Principal del API Gateway
 * Define las rutas proxy hacia cada microservicio.
 * Cada ruta aplica los middlewares de autenticación y rate-limiting.
 * El Circuit Breaker se evalúa antes de hacer el proxy al servicio destino.
 * En producción se puede usar http-proxy-middleware para el forwarding real.
 */

import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { rateLimitMiddleware } from '../middleware/rate-limit.middleware';
import { isAvailable, recordFailure, recordSuccess } from '../middleware/circuit-breaker.middleware';

const router = Router();

// URLs de los microservicios (en producción vienen de variables de entorno)
const SERVICES = {
  appointment: process.env.APPOINTMENT_SERVICE_URL || 'http://appointment-service:3001',
  telemedicine: process.env.TELEMEDICINE_SERVICE_URL || 'http://telemedicine-service:3002',
  ehr: process.env.EHR_SERVICE_URL || 'http://ehr-service:3003',
  prescription: process.env.PRESCRIPTION_SERVICE_URL || 'http://prescription-service:3004',
  iot: process.env.IOT_SERVICE_URL || 'http://iot-service:3005',
  audit: process.env.AUDIT_SERVICE_URL || 'http://audit-service:3006',
};

// Proxy helper que aplica Circuit Breaker
async function proxyRequest(
  serviceName: keyof typeof SERVICES,
  req: Request,
  res: Response
): Promise<void> {
  if (!isAvailable(serviceName)) {
    res.status(503).json({ error: `Servicio ${serviceName} temporalmente no disponible` });
    return;
  }

  try {
    // En producción: usar http-proxy-middleware o node-fetch para forwarding real
    const targetUrl = `${SERVICES[serviceName]}${req.path}`;
    res.json({ proxiedTo: targetUrl, status: 'forwarded' });
    recordSuccess(serviceName);
  } catch (error) {
    recordFailure(serviceName);
    res.status(502).json({ error: 'Error al comunicarse con el servicio' });
  }
}

// Rutas protegidas por JWT y Rate Limiting
router.use(authMiddleware);
router.use(rateLimitMiddleware);

router.all('/appointments/*', (req, res) => proxyRequest('appointment', req, res));
router.all('/telemedicine/*', (req, res) => proxyRequest('telemedicine', req, res));
router.all('/ehr/*', (req, res) => proxyRequest('ehr', req, res));
router.all('/prescriptions/*', (req, res) => proxyRequest('prescription', req, res));
router.all('/iot/*', (req, res) => proxyRequest('iot', req, res));
router.all('/audit/*', (req, res) => proxyRequest('audit', req, res));

export default router;
