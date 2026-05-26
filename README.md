# MediConnect S.A.S. - Plataforma Nacional de Telemedicina

## Descripción General
Monorepo de la plataforma de telemedicina de alta disponibilidad diseñada para operar en contextos rurales y urbanos de Bolivia. Implementa una arquitectura basada en microservicios con Event Sourcing, persistencia políglota y cumplimiento normativo mediante auditoría inmutable.

## Integrantes del Equipo
- Equipo MediConnect S.A.S.

## Estructura del Monorepo
- `api-gateway/`         — Orquestador: Auth JWT, Rate Limiting, Circuit Breaker
- `services/`            — Microservicios del backend (Clean Architecture)
- `shared/`              — Código compartido: eventos Kafka, DTOs, guards JWT
- `infrastructure/`      — IaC: Docker Compose y Terraform
- `client/`              — PWA Offline-First con Service Workers e IndexedDB
- `docs/`                — Diagramas C4, ADRs y diagramas de secuencia

## Sprints Planificados
- **Sprint 0**: Configuración del Monorepo y pipelines de CI/CD
- **Sprint 1**: Implementación de api-gateway y appointment-service
- **Sprint 2**: Integración del legacy-adapter y lógica de persistencia inmutable
- **Validación**: Sesión del 28/05/2026 para auditoría de diagramas y HU

## Tecnologías Clave
| Capa | Tecnología |
|------|-----------|
| API Gateway | Node.js + Express |
| Mensajería | Apache Kafka |
| BD Relacional | PostgreSQL |
| BD Documental | MongoDB |
| BD Series Temp. | InfluxDB |
| IoT | MQTT |
| Video | WebRTC |
| Storage | AWS S3 |
| IaC | Docker Compose + Terraform |
| PWA | Service Workers + IndexedDB |
