/**
 * Middleware de Autenticación JWT
 * Valida el token Bearer en cada request entrante al API Gateway.
 * Extrae el payload (userId, role) y lo adjunta a req.user para
 * que los microservicios downstream puedan tomar decisiones de autorización.
 * Si el token es inválido o ha expirado, retorna 401 Unauthorized.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mediconnect-secret';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: 'patient' | 'doctor' | 'admin' | 'ministry_auditor';
    email: string;
  };
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token de autenticación requerido' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthenticatedRequest['user'];
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}
