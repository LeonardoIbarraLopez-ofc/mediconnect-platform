# Diagramas C4 — MediConnect Platform

> Mantenido actualizado según el estado real del sistema construido.
> Última actualización: 2026-05-26

---

## Nivel 1: Diagrama de Contexto

Muestra quién usa el sistema y con qué sistemas externos se integra.

```
                    ┌─────────────────────────────────────────────────────┐
                    │              SISTEMA MEDICONNECT                    │
                    │       Plataforma Nacional de Telemedicina           │
                    │                  Bolivia                            │
                    └──────────────────────┬──────────────────────────────┘
                                           │
              ┌────────────────────────────┼────────────────────────────┐
              │                            │                            │
       ┌──────▼──────┐             ┌───────▼──────┐             ┌──────▼──────┐
       │  Paciente   │             │    Médico    │             │  Técnico    │
       │ (PWA/móvil) │             │ (PWA/web)    │             │  de Salud   │
       │             │             │              │             │  Rural      │
       └──────┬──────┘             └───────┬──────┘             └──────┬──────┘
              │                            │                            │
              └────────────┬───────────────┘                            │
                           │ HTTPS / JWT                                │ Offline-First
                   ┌───────▼────────┐                          ┌────────▼───────┐
                   │  API Gateway   │                          │   PWA Cliente  │
                   │  :3000         │                          │ (IndexedDB +   │
                   │  JWT · Rate    │                          │  ServiceWorker)│
                   │  Limit · CB    │                          └────────────────┘
                   └───────┬────────┘
                           │
        ┌──────────────────┼──────────────────────────────┐
        │                  │                              │
 ┌──────▼──────┐    ┌──────▼──────┐               ┌──────▼──────┐
 │  Ministerio │    │  Farmacias  │               │Dispositivos │
 │  de Salud   │    │  Conectadas │               │  IoT        │
 │  (auditoría)│    │  (recetas)  │               │(glucómetros,│
 └─────────────┘    └─────────────┘               │tensiómetros)│
                                                   └─────────────┘
```

**Sistemas Externos**

| Sistema | Tipo | Propósito |
|---------|------|-----------|
| Sistema COBOL Ministerio | Legado | Historial clínico previo de pacientes |
| Dispositivos IoT médicos | Hardware | Glucómetros, tensiómetros, oxímetros vía MQTT |
| AWS S3 / MinIO (dev) | Cloud Storage | Grabaciones cifradas de videoconsultas |
| SMS / Push Gateway | Notificaciones | Alertas críticas a médicos tratantes |

---

## Nivel 2: Diagrama de Contenedores

Muestra los procesos internos del sistema y sus bases de datos.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               MEDICONNECT PLATFORM                                      │
│                                                                                         │
│  ┌──────────────┐    ┌─────────────────────────────────────────────────────────────┐   │
│  │  PWA Client  │    │                      API GATEWAY :3000                      │   │
│  │  React +     │───▶│  JWT Auth · Rate Limit (100/min) · Circuit Breaker          │   │
│  │  ServiceWrkr │    │  Proxy HTTP real via http-proxy-middleware                  │   │
│  │  IndexedDB   │    └──────────────────────────┬──────────────────────────────────┘   │
│  │  SyncManager │                               │                                      │
│  └──────────────┘        ┌────────────────────────────────────────────┐                │
│                          │              Apache Kafka                  │                │
│                          │  topics: appointment.created               │                │
│                          │          appointment.status_changed        │                │
│                          │          session.ended                     │                │
│                          │          prescriptions.issued              │                │
│                          │          alert.critical                    │                │
│                          └──────┬─────────┬──────────┬───────────────┘                │
│                                 │         │          │                                 │
│  ┌──────────────┐  ┌────────────▼──┐  ┌───▼──────────▼──┐  ┌──────────────────────┐  │
│  │ appointment  │  │ telemedicine  │  │  ehr-service     │  │  prescription        │  │
│  │ service :3001│  │ service :3002 │  │  :3003           │  │  service :3004       │  │
│  │              │  │               │  │                  │  │                      │  │
│  │ PostgreSQL   │  │ WebRTC rooms  │  │ MongoDB          │  │ PostgreSQL           │  │
│  │ appointments │  │ S3 recordings │  │ + COBOL Adapter  │  │ + RSA firma digital  │  │
│  └──────────────┘  └───────────────┘  └──────────────────┘  └──────────────────────┘  │
│                                                                                         │
│  ┌──────────────┐  ┌───────────────────────────────────────────────────────────────┐   │
│  │ iot-service  │  │  audit-service :3006                                          │   │
│  │ :3005        │  │                                                               │   │
│  │              │  │  PostgreSQL Ledger (append-only, sin UPDATE/DELETE)           │   │
│  │ MQTT ◀──────────│  HMAC-SHA256 por evento · sequence_number incremental         │   │
│  │ Mosquitto    │  │  Consume TODOS los topics Kafka                               │   │
│  │ InfluxDB     │  │  GET /audit/events — solo lectura para el Ministerio          │   │
│  │ (telemetría) │  └───────────────────────────────────────────────────────────────┘   │
│  └──────────────┘                                                                       │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Nivel 2: Flujo de Datos — Happy Path Completo

```
Paciente                API Gateway         appointment-service      Kafka
   │                        │                       │                  │
   │── POST /appointments ──▶│                       │                  │
   │                        │── proxy (JWT OK) ────▶│                  │
   │                        │                       │── appointment.created ──▶│
   │◀── 201 cita creada ────│◀──────────────────────│                  │
   │                        │                       │                  │
   │                  (a la hora de la cita)         │                  │
   │                        │                       │            telemedicine-service
   │── POST /telemedicine ──▶│                       │                  │
   │◀── roomToken + ICE ────│                       │◀── session.ended ─┤
   │                        │                                           │
   │                        │                    ehr-service            │
   │                        │                       │◀─ session.ended ──┤
   │                        │                       │  (agrega resumen) │
   │                        │                       │                   │
   │── POST /prescriptions ─▶│              prescription-service        │
   │◀── receta firmada RSA ─│                       │── prescriptions.issued ──▶│
   │                        │                                           │
   │                        │                    audit-service          │
   │                        │                       │◀─ todos los events┤
   │                        │                       │  (Ledger inmutable)│
```

---

## Nivel 2: Flujo IoT — Alerta Crítica

```
Dispositivo IoT          Mosquitto          iot-service              Kafka
     │                      │                   │                      │
     │── MQTT publish ──────▶│                   │                      │
     │  mediconnect/patients/│── msg callback ──▶│                      │
     │  {id}/devices/{id}/   │                   │── EvaluateTelemetry  │
     │  blood_pressure        │                   │   sistólica > 140?   │
     │                       │                   │── alert.critical ───▶│
     │                       │                   │── write InfluxDB     │
     │                       │                   │                      │
     │                       │              audit-service               │
     │                       │                   │◀─ alert.critical ───┤
     │                       │                   │  (Ledger inmutable)  │
     │                       │                   │                      │
     │                       │         (SMS/Push al médico tratante)    │
```

---

## Nivel 2: Estrategia Offline-First (Técnico Rural)

```
PWA Client (sin red)                    (red disponible)        API Gateway
      │                                        │                      │
      │── createAppointment() ──▶              │                      │
      │   IndexedDB.save(pending)              │                      │
      │                                        │                      │
      │   [usuario trabaja offline]            │                      │
      │                                        │                      │
      │   navigator.online = true ────────────▶│                      │
      │                              SyncManager.sync()               │
      │                                        │── POST /appointments ─▶│
      │                                        │◀── 201 ──────────────│
      │                              IndexedDB.markSynced(id)         │
```

---

## Decisiones de Persistencia por Servicio

| Servicio | Motor | Justificación |
|----------|-------|---------------|
| appointment-service | PostgreSQL | Estados de cita con transiciones ACID |
| telemedicine-service | S3 / MinIO | Grabaciones binarias de gran tamaño |
| ehr-service | MongoDB | Registros clínicos polimórficos (ver ADR-002) |
| prescription-service | PostgreSQL | Recetas con firma RSA, trazabilidad fuerte |
| iot-service | InfluxDB | Time-series nativo para métricas IoT |
| audit-service | PostgreSQL | Ledger append-only con sequence_number |

---

## Atributos de Calidad — Estado Real

| Atributo | Mecanismo Implementado |
|----------|----------------------|
| **Disponibilidad** | Offline-First: ServiceWorker + IndexedDB + SyncManager |
| **Resiliencia** | Circuit Breaker (5 fallos → OPEN, recovery 30s) en API Gateway |
| **Seguridad** | JWT 8h · HMAC-SHA256 en eventos Kafka · RSA en recetas |
| **Trazabilidad** | audit-service Ledger append-only, consume todos los topics |
| **Integración Legado** | Anti-Corruption Layer (CobolLegacyAdapter) en ehr-service |
| **Observabilidad** | Pino JSON logging en api-gateway · healthchecks Docker |
| **Validación** | Zod en todos los endpoints de escritura (400 con detalle) |
