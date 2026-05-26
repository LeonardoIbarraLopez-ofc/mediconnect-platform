/**
 * Guard de Autenticación JWT (Compartido)
 * Lógica reutilizable de validación JWT que usan tanto el API Gateway
 * como los microservicios individuales (en caso de comunicación directa).
 * Verifica la firma del token, su expiración y extrae el payload de usuario.
 * Los roles válidos: 'patient', 'doctor', 'admin', 'ministry_auditor'.
 */

import jwt from 'jsonwebtoken';

export type UserRole = 'patient' | 'doctor' | 'admin' | 'ministry_auditor';

export interface JwtPayload {
  userId: string;
  role: UserRole;
  email: string;
  iat: number;
  exp: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'mediconnect-secret';

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

export function hasRole(payload: JwtPayload, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(payload.role);
}
