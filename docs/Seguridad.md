
# Seguridad

## Datos en tránsito y en reposo
- TLS extremo a extremo.  
- **En reposo**: cifrado mediante TDE en el proveedor y **pgcrypto** a nivel columna para CUIT/DNI, CBU y datos sensibles.  
- Rotación de claves y **JWT_SECRET** (corto vencimiento + refresh).

## Gestión de accesos (RBAC + SoD)
- Permisos granulares (ver `src/security/permissions.ts`).  
- **Segregation of Duties**: quien crea liquidación **no puede** aprobarla ni exportarla. Enforcement en guards.

## Auditoría
- **AuditLog** para INSERT/UPDATE/DELETE de tablas críticas con *diff* y usuario.  
- Snapshots inmutables con `contextHash` para reconciliación y peritajes.

## Multi-tenant
- Estrategia por defecto: **RLS** (Row Level Security) con `institucionId` + middleware Prisma que inyecta el `tenantId`.  
- Alternativas: *schema-per-tenant*, *db-per-tenant* (evaluar costo operativo).

## Read Replicas y Lag
- Solo **lecturas no transaccionales** (reportes/históricos) van a réplica.  
- **Lag guard**: alertar si `now() - pg_last_xact_replay_timestamp()` > umbral; desviar a primaria si excede.

## Validaciones AFIP
- Validador previo a exportar (CUIL/Conceptos/Totales/Fechas).  
- Reporte de errores por lote y *retry* seguro.
