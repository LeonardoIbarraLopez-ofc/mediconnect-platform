/**
 * Middleware de Rate Limiting por Usuario
 * Limita la cantidad de requests que un usuario autenticado puede realizar
 * en una ventana de tiempo determinada (default: 100 req/min).
 * Protege los microservicios de abuso y ataques de denegación de servicio.
 * Almacena los contadores en memoria (producción debería usar Redis).
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  count: number;
  resetAt: number;
}

// En producción reemplazar con Redis para compartir estado entre instancias
const store = new Map<string, RateLimitStore>();

const WINDOW_MS = 60 * 1000; // 1 minuto
const MAX_REQUESTS = 100;

export function rateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Usar IP como fallback si no hay usuario autenticado
  const key = (req as any).user?.userId ?? req.ip ?? 'anonymous';
  const now = Date.now();

  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    next();
    return;
  }

  if (entry.count >= MAX_REQUESTS) {
    res.status(429).json({
      error: 'Demasiadas solicitudes. Intente nuevamente en un minuto.',
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    });
    return;
  }

  entry.count++;
  next();
}
