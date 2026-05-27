# ADR-002: MongoDB para el Historial Clínico Electrónico (EHR)

**Estado**: Aceptado
**Fecha**: 2026-05-26
**Decisores**: Equipo MediConnect S.A.S.

## Contexto

El EHR (Electronic Health Record) service almacena historiales clínicos de pacientes
consolidando datos heterogéneos: consultas médicas, resultados de laboratorio, recetas
emitidas, grabaciones de videoconsultas y registros migrados desde el sistema COBOL
del Ministerio de Salud. El modelo `ClinicalRecord` es polimórfico — cada tipo de registro
tiene campos propios y opcionales que difieren entre sí.

## Opciones Consideradas

1. **PostgreSQL** — relacional, esquema rígido, ACID
2. **MongoDB** — documental, esquema flexible, escalado horizontal nativo
3. **CockroachDB** — distribuido, PostgreSQL-compatible

## Decisión

Se adopta **MongoDB** como motor de persistencia exclusivo para el `ehr-service`.

## Justificación

- **Esquema polimórfico**: `ClinicalRecord` tiene variantes (`consultation`, `lab_result`,
  `prescription`, `recording`) con campos opcionales distintos en cada una. PostgreSQL
  requeriría tablas separadas por tipo o columnas JSONB — MongoDB almacena cada variante
  como subdocumento sin necesidad de migración de esquema al agregar nuevos tipos.

- **Document Model natural**: `PatientHistory` es un documento con un array embebido de
  `ClinicalRecord[]`. Leer el historial completo de un paciente es una sola operación
  `findOne({ patientId })` versus múltiples JOINs en PostgreSQL.

- **Integración con legado COBOL**: El `CobolLegacyAdapter` recibe registros del Ministerio
  en formatos variables y los normaliza en arrays de `ClinicalRecord`. MongoDB absorbe
  esta variabilidad estructural sin cambios de esquema.

- **Patrón append-only**: El EHR solo agrega registros (`addRecord`), nunca los modifica ni
  elimina. No se requieren transacciones multi-documento ACID — la fortaleza central de
  PostgreSQL — lo que elimina la principal desventaja de MongoDB.

- **Escalabilidad horizontal**: Los historiales clínicos crecen indefinidamente a lo largo
  de la vida del paciente. MongoDB soporta sharding por `patientId` de forma nativa,
  distribuyendo la carga sin cambios en la capa de aplicación.

## Consecuencias

- **Positivas**: Sin migraciones de esquema al incorporar nuevos tipos de registro clínico;
  lectura del historial completo en O(1) por `patientId`; absorción natural de datos
  heterogéneos del sistema COBOL.

- **Negativas**: Sin joins relacionales entre colecciones; consistencia eventual bajo
  sharding; herramienta diferente al PostgreSQL usado por los demás servicios.

- **Mitigación**: La consistencia eventual es aceptable para historial de consulta médica
  (no es un sistema transaccional financiero). Los registros de alta criticidad —
  recetas firmadas y auditoría — son responsabilidad de `prescription-service` y
  `audit-service`, ambos con PostgreSQL y garantías ACID completas.

## Contrato de Datos

El repositorio `MongoEhrRepository` usa upsert con `$set` para `PatientHistory` y
`$push` para agregar `ClinicalRecord[]`. Ninguna operación modifica ni elimina
registros existentes — solo se añaden.
