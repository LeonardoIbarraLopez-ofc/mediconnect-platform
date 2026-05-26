# ADR-001: Arquitectura Event-Driven con Kafka

**Estado**: Aceptado
**Fecha**: 2026-05-26
**Decisores**: Equipo MediConnect S.A.S.

## Contexto

La plataforma de telemedicina necesita comunicar eventos clínicos (citas, recetas, alertas)
entre múltiples microservicios de forma resiliente, especialmente en escenarios donde un
servicio puede estar temporalmente caído (ej: telemedicine-service en zona rural con corte de fibra).

## Opciones Consideradas

1. **REST síncrono (HTTP)** — Comunicación directa entre servicios
2. **Apache Kafka (Event Streaming)** — Bus de mensajes asíncrono
3. **RabbitMQ (Message Queue)** — Cola de mensajes tradicional

## Decisión

Se adopta **Apache Kafka** como bus de mensajería asíncrona entre todos los microservicios.

## Justificación

- **Resiliencia**: Si audit-service está caído, los eventos se retienen en Kafka y se procesan al recuperarse. Con REST síncrono se perdería la auditoría.
- **Event Sourcing**: Kafka permite replay de eventos, crítico para reconstruir el estado del Ledger de auditoría.
- **Escalabilidad**: Los consumidores (ehr-service, audit-service) pueden escalar horizontalmente sin cambiar los productores.
- **Cumplimiento legal**: El historial de eventos en Kafka sirve como evidencia adicional además del Ledger.

## Consecuencias

- **Positivas**: Desacoplamiento total entre servicios, fault tolerance, replay capability.
- **Negativas**: Complejidad operacional (Kafka + Zookeeper), eventual consistency (no transacciones distribuidas).
- **Mitigación**: Se usa el patrón Outbox para garantizar exactly-once delivery en operaciones críticas (firma de recetas).

## Contrato de Eventos

Todos los eventos extienden `HealthRecordChangedEvent` del módulo `shared/events/`.
La firma HMAC es obligatoria y verificada por audit-service antes de persistir.
