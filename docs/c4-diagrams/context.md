# Diagrama C4: Contexto del Sistema MediConnect

> Según FUNCIONAMIENTO.MD: "El equipo debe mantener los archivos en /docs
> actualizados diariamente (ADR, Diagramas C4)."

## Nivel 1: Diagrama de Contexto

```
┌─────────────────────────────────────────────────────────────────────┐
│                     SISTEMA MEDICONNECT                             │
│           Plataforma Nacional de Telemedicina Bolivia               │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
         ┌─────────────────┼──────────────────────────┐
         │                 │                          │
    ┌────▼────┐      ┌─────▼─────┐           ┌───────▼──────┐
    │Paciente │      │  Médico   │           │  Ministerio  │
    │(PWA/App)│      │ (PWA/Web) │           │  de Salud    │
    └────┬────┘      └─────┬─────┘           └───────┬──────┘
         │                 │                          │
         └────────┬────────┘                          │
                  │ HTTPS/JWT                         │ Audit API
         ┌────────▼────────┐                 ┌───────▼──────┐
         │   API Gateway   │                 │ audit-service│
         │  (Puerto :3000) │                 │  (Ledger)    │
         └────────┬────────┘                 └──────────────┘
                  │ Kafka Events
    ┌─────────────┼─────────────────────────────────┐
    │             │             │                   │
┌───▼────┐  ┌────▼────┐  ┌─────▼─────┐  ┌─────────▼──────┐
│Appoint-│  │Telemed- │  │   EHR     │  │ Prescription   │
│ment Svc│  │ icine   │  │ Service   │  │   Service      │
│  PG    │  │  S3/WRT │  │ MongoDB + │  │   PG + RSA     │
│        │  │         │  │ COBOL ACL │  │                │
└────────┘  └─────────┘  └───────────┘  └────────────────┘
         │
    ┌────▼────┐
    │  IoT   │
    │Service │
    │InfluxDB│
    │ + MQTT │
    └─────────┘
```

## Sistemas Externos

| Sistema | Tipo | Propósito |
|---------|------|-----------|
| Sistema COBOL Ministerio | Legado | Historial previo de pacientes |
| Dispositivos IoT | Médicos | Glucómetros, tensiómetros, oxímetros |
| AWS S3 | Cloud Storage | Grabaciones cifradas de videoconsultas |
| SMTP/SMS Gateway | Notificaciones | Alertas críticas a médicos |

## Atributos de Calidad Priorizados
1. **Disponibilidad**: Offline-First en zonas rurales via Service Worker + IndexedDB
2. **Seguridad**: JWT, WebRTC cifrado E2E, firma RSA en recetas, HMAC en eventos
3. **Trazabilidad**: Ledger append-only en audit-service (Event Sourcing)
4. **Integración Legado**: Anti-Corruption Layer (cobol-adapter.ts) en ehr-service
