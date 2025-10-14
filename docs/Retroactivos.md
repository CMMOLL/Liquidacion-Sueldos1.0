
# Retroactivos: Estrategia, Flujo y Consideraciones Fiscales

## Objetivo
Gestionar ajustes por cambios tardíos (parámetros, antigüedad, subvención, etc.) con **trazabilidad**, **idempotencia** y **cumplimiento fiscal**.

## Estrategias evaluadas
- **A) Re-liquidar períodos pasados (histórico cambia)** – ❌ Riesgoso con AFIP; reenvíos complejos.
- **B) Aplicar ajuste en período actual (delta)** – ✅ Recomendado; mantiene histórico y concilia con AFIP vía conceptos de ajuste.
- **C) Híbrido** – Re-liquidar internamente sin reenviar a AFIP y aplicar delta en presente.

> Por defecto, el sistema utiliza **B**. C y A requieren aprobación explícita y controles adicionales.

## Modelo de datos (resumen)
- **Ledger de deltas**: por `agenteId`, `periodo_afectado`, `periodo_aplicacion`, `motivo` y `origen`.
- **Snapshot**: cada liquidación final genera un registro inmutable con `contextHash` y `resultadoJson`.
- **AuditLog**: cambios a parámetros/tablas críticas con `diff`.

## RetroactivoContext (API)
```ts
export interface RetroactivoContext {
  periodoOrigen: string;      // detección del cambio
  periodosAjustar: string[];  // períodos históricos a recalcular
  motivoCodigo: string;       // ej. 'CAMBIO_ANTIGUEDAD', 'AJUSTE_SUBVENCION'
  aprobadoPor: string;
  estado: 'BORRADOR' | 'APROBADO' | 'APLICADO';
}
```

## Flujo
1. **Detección** (diff de parámetros o cambio de designación).  
2. **Cálculo** (dry-run): re-evaluar períodos afectados → generar **deltas**.  
3. **Aprobación** (RBAC + SoD): firma de responsable.  
4. **Aplicación**: aplicar delta en el **periodo actual** (opción C: híbrido).  
5. **Conciliación**: reporte de diferencias + export AFIP/Banco específico de ajuste.  
6. **Auditoría**: snapshot y audit log de toda la operación.
