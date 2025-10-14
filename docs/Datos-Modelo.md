
# Datos y Modelo

## Tablas clave para trazabilidad
- **LiquidacionSnapshot**: resultado inmutable por agente/periodo con `contextHash`.  
- **AuditLog**: auditoría de cambios con `diff` y usuario.

Ver `prisma/audit_models.prisma` para definiciones.

## Parámetros de cálculo
- Índices por período, nomencladores y multiplicadores versionados con vigencias (`desde/hasta`) para consultas **as-of**.  
- Claves de caché en Redis por `parametros:{periodo}:v{hash}`.

## Read/Write split
- Cliente write contra `DATABASE_URL`; cliente read contra `READ_DB_URL`.  
- Rutas críticas del engine **siempre** en write. Reportes/históricos en read (con guard de lag).
