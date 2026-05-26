# Diagrama de Secuencia: Flujo Completo de Atención Médica

Según FUNCIONAMIENTO.MD sección 1: "Flujo de Atención Médica (Happy Path)"

## Secuencia: Cita → Videoconsulta → Receta

```
Paciente         API Gateway       Appointment    Telemedicine    EHR           Prescription   Audit
   │                  │              Service        Service      Service          Service      Service
   │                  │                │               │            │                │            │
   │─── POST /appointments ──────────►│                │            │                │            │
   │                  │──── JWT ──────►│                │            │                │            │
   │                  │               │─ save PG ─────►│            │                │            │
   │                  │               │                │            │                │            │
   │                  │               │── appointment.created ──────────────────────────────────►│
   │                  │               │                │            │                │           │─ #seq+1 ─►PG
   │◄─── 201 {id} ───────────────────│                │            │                │            │
   │                  │                │               │            │                │            │
   │─── POST /telemedicine/sessions/start ───────────►│            │                │            │
   │                  │                │◄─ validate cita            │                │            │
   │                  │               │               │─ createRoom WebRTC ─────────│            │
   │◄── {roomToken, iceServers} ──────────────────────│            │                │            │
   │                  │                │               │            │                │            │
   │═══════════════ [VideoConsulta WebRTC P2P cifrada] ═══════════════════════════════════════════│
   │                  │                │               │            │                │            │
   │─── POST /sessions/:id/end ───────────────────────►│           │                │            │
   │                  │                │               │─ upload S3─►               │            │
   │                  │                │               │            │                │            │
   │                  │                │               │── session.ended ───────────►│            │
   │                  │                │               │            │─ merge COBOL ──│            │
   │                  │                │               │            │── ehr.updated ─────────────►│
   │                  │                │               │            │                │           │─ #seq+1 ─►PG
   │                  │                │               │            │                │            │
   │─── POST /prescriptions ────────────────────────────────────────────────────────►│           │
   │                  │                │               │            │                │─ RSA sign ─│
   │                  │                │               │            │                │─ save PG ──│
   │                  │                │               │            │                │            │
   │                  │                │               │            │                │── prescriptions.issued ─►│
   │                  │                │               │            │◄─ consume ─────│           │─ #seq+1 ─►PG
   │◄── 201 {prescriptionId} ─────────────────────────────────────────────────────────────────────│
```

## Flujo Offline (Zona Rural)

```
Técnico Rural      Service Worker      IndexedDB        SyncManager       API Gateway
      │                  │                 │                 │                  │
      │─── POST /appointments ────────────►│                 │                  │
      │                  │─── fetch() fails (sin red)        │                  │
      │                  │─── store pendingEvent ───────────►│                  │
      │◄── 202 {queued} ─│                 │                 │                  │
      │                  │                 │                 │                  │
      │════ [Usuario trabaja offline] ═════════════════════════════════════════│
      │                  │                 │                 │                  │
      │                  │─ online event ──────────────────►│                  │
      │                  │                 │                 │─ getPending() ──►│
      │                  │                 │                 │◄─ [records] ─────│
      │                  │                 │                 │─ POST /sync ─────────────────────►│
      │                  │                 │                 │◄── 200 OK ──────────────────────────│
      │                  │                 │                 │─ markSynced() ──►│                  │
```
