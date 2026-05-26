/**
 * Enrutador Principal del API Gateway
 * Hace proxy real de cada request hacia el microservicio correspondiente
 * usando http-proxy-middleware. El Circuit Breaker evalúa la disponibilidad
 * del servicio destino antes de cada request, y registra éxitos/fallos
 * según el status code de la respuesta upstream.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { rateLimitMiddleware } from '../middleware/rate-limit.middleware';
import { isAvailable, recordFailure, recordSuccess } from '../middleware/circuit-breaker.middleware';

const router = Router();

const SERVICES = {
  appointment: process.env.APPOINTMENT_SERVICE_URL || 'http://appointment-service:3001',
  telemedicine: process.env.TELEMEDICINE_SERVICE_URL || 'http://telemedicine-service:3002',
  ehr: process.env.EHR_SERVICE_URL || 'http://ehr-service:3003',
  prescription: process.env.PRESCRIPTION_SERVICE_URL || 'http://prescription-service:3004',
  iot: process.env.IOT_SERVICE_URL || 'http://iot-service:3005',
  audit: process.env.AUDIT_SERVICE_URL || 'http://audit-service:3006',
} as const;

type ServiceName = keyof typeof SERVICES;

function circuitBreakerGuard(serviceName: ServiceName) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    if (!isAvailable(serviceName)) {
      res.status(503).json({ error: `Servicio ${serviceName} temporalmente no disponible` });
      return;
    }
    next();
  };
}

function makeProxy(serviceName: ServiceName) {
  return createProxyMiddleware({
    target: SERVICES[serviceName],
    changeOrigin: true,
    on: {
      proxyRes: (proxyRes) => {
        if (proxyRes.statusCode !== undefined && proxyRes.statusCode >= 500) {
          recordFailure(serviceName);
        } else {
          recordSuccess(serviceName);
        }
      },
      error: (_err, _req, res) => {
        recordFailure(serviceName);
        (res as Response).status(502).json({ error: 'Error al comunicarse con el servicio' });
      },
    },
  });
}

router.use(authMiddleware);
router.use(rateLimitMiddleware);

router.use('/appointments', circuitBreakerGuard('appointment'), makeProxy('appointment'));
router.use('/telemedicine', circuitBreakerGuard('telemedicine'), makeProxy('telemedicine'));
router.use('/ehr', circuitBreakerGuard('ehr'), makeProxy('ehr'));
router.use('/prescriptions', circuitBreakerGuard('prescription'), makeProxy('prescription'));
router.use('/iot', circuitBreakerGuard('iot'), makeProxy('iot'));
router.use('/audit', circuitBreakerGuard('audit'), makeProxy('audit'));

export default router;
