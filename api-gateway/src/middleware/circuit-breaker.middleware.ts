/**
 * Middleware Circuit Breaker por Servicio
 * Implementa el patrón Circuit Breaker para evitar cascading failures.
 * Si un microservicio (ej: telemedicine-service) falla repetidamente,
 * el circuito se "abre" y las requests fallan rápido (fail-fast) sin
 * esperar el timeout, protegiendo servicios críticos como appointment-service.
 * Estados: CLOSED (normal) → OPEN (fallo) → HALF-OPEN (prueba recuperación).
 */

import { logger } from '../logger';

interface CircuitState {
  failures: number;
  lastFailureTime: number;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

const FAILURE_THRESHOLD = 5;
const RECOVERY_TIMEOUT_MS = 30_000; // 30 segundos

const circuits = new Map<string, CircuitState>();

export function getCircuit(serviceName: string): CircuitState {
  if (!circuits.has(serviceName)) {
    circuits.set(serviceName, { failures: 0, lastFailureTime: 0, state: 'CLOSED' });
  }
  return circuits.get(serviceName)!;
}

export function recordSuccess(serviceName: string): void {
  const circuit = getCircuit(serviceName);
  circuit.failures = 0;
  circuit.state = 'CLOSED';
}

export function recordFailure(serviceName: string): void {
  const circuit = getCircuit(serviceName);
  circuit.failures++;
  circuit.lastFailureTime = Date.now();

  if (circuit.failures >= FAILURE_THRESHOLD) {
    circuit.state = 'OPEN';
    logger.error({ serviceName, failures: circuit.failures }, '[CircuitBreaker] Circuito ABIERTO');
  }
}

export function isAvailable(serviceName: string): boolean {
  const circuit = getCircuit(serviceName);

  if (circuit.state === 'CLOSED') return true;

  if (circuit.state === 'OPEN') {
    const elapsed = Date.now() - circuit.lastFailureTime;
    if (elapsed > RECOVERY_TIMEOUT_MS) {
      circuit.state = 'HALF_OPEN';
      return true;
    }
    return false;
  }

  // HALF_OPEN: permite una request de prueba
  return true;
}
