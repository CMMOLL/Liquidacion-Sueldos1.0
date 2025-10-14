# Engine de Reglas – Contrato y Ejemplos

El motor aplica reglas determinísticas y **sin efectos colaterales** sobre un **contexto inmutable**, produciendo un resultado acumulado que luego los *presenters* convierten a DTOs de salida.

## Contrato `ILiquidacionRule`

```ts
export interface ILiquidacionRule {
  /** Identificador estable para métricas y auditoría */
  readonly id: string;
  /** Menor número = mayor prioridad */
  readonly prioridad: number;
  /** Señala si corresponde ejecutar la regla para el contexto dado */
  applies(ctx: LiquidacionContext): boolean | Promise<boolean>;
  /** Efectúa el cálculo y devuelve un resultado parcial puro */
  execute(ctx: LiquidacionContext): Promise<ResultadoParcial>;
}

export type ResultadoParcial = Readonly<{
  lineas: ReadonlyArray<{
    conceptoCodigo: string;
    tipo: 'REM' | 'NR' | 'DESC';
    importe: number;
    meta?: Record<string, unknown>;
  }>;
  eventos?: ReadonlyArray<{
    type: string; // para auditoría interna del motor
    payload: Record<string, unknown>;
  }>;
}>;
```

### Contexto inmutable

```ts
export type LiquidacionContext = Readonly<{
  periodo: string; // YYYY-MM
  agente: Readonly<AgenteSnapshot>;
  designaciones: ReadonlyArray<DesignacionSnapshot>;
  parametros: Readonly<ParametrosPeriodo>;
}>;

export const deepFreeze = <T>(obj: T): Readonly<T> => {
  if (obj && typeof obj === 'object') {
    Object.freeze(obj as object);
    for (const key of Object.keys(obj as object)) {
      // @ts-ignore
      deepFreeze((obj as any)[key]);
    }
  }
  return obj as Readonly<T>;
};
```

## Pipeline del engine

1. Ordenar las reglas por `prioridad` ascendente.
2. Para cada regla: `applies(ctx)` → si `true`, `execute(ctx)`.
3. Agregar `ResultadoParcial.lineas` al *accumulator* y registrar `eventos` (para auditoría/diagnóstico).
4. Publicar métricas/trazas por **regla** (OTEL span con `rule_name`, `dur_ms`, `agente_id`, `periodo`).

```ts
for (const rule of reglasOrdenadas) {
  const span = tracer.startSpan('rule.execute', { attributes: { rule_name: rule.id } });
  const shouldRun = await rule.applies(ctx);
  if (shouldRun) {
    const res = await rule.execute(ctx);
    acc = merge(acc, res);
  }
  span.end();
}
```

## Ejemplo de regla: Antigüedad

```ts
export class AntiguedadRule implements ILiquidacionRule {
  readonly id = 'antiguedad';
  readonly prioridad = 100;

  applies(ctx: LiquidacionContext): boolean {
    return true; // siempre aplica
  }

  async execute(ctx: LiquidacionContext): Promise<ResultadoParcial> {
    const meses = calcularMesesAntiguedad(ctx.agente.fechaIngreso, ctx.periodo);
    const porcentaje = tramoPorcentajeAntiguedad(meses);
    const base = obtenerSueldoBase(ctx);
    const importe = redondear2(base * porcentaje);

    return {
      lineas: [{
        conceptoCodigo: 'ANTIGUEDAD',
        tipo: 'REM',
        importe,
        meta: { meses, porcentaje }
      }],
      eventos: [{ type: 'ANTIGUEDAD_CALCULADA', payload: { meses, porcentaje, base } }]
    };
  }
}
```

> **Pureza y testabilidad**: `calcularMesesAntiguedad`, `tramoPorcentajeAntiguedad` y `obtenerSueldoBase` deben ser **funciones puras**. Las dependencias externas (repos/IO) nunca se llaman desde la regla.

## Registro de reglas

```ts
const REGLAS: ILiquidacionRule[] = [
  new AntiguedadRule(),
  new BasicoDocenteRule(),
  new PresentismoRule(),
  // ...
];
```

## Presenters y DTOs de salida

Los *presenters* traducen el acumulado del engine a DTOs consumidos por los *drivers* de `output/` (DIP). Ej.:

```ts
export interface PayoutLineDTO {
  agenteId: string;
  conceptoCodigo: string;
  importe: number;
  tipo: 'REM' | 'NR' | 'DESC';
}
export interface PayoutBatchDTO {
  periodo: string;
  institucionId: string;
  lineas: PayoutLineDTO[];
}
```

## Testing

- **Unit**: reglas aisladas con *fixtures* mínimos.  
- **Property-based**: monotonía, cotas (≥0), idempotencia (mismo contexto → mismo resultado).  
- **Integración**: ejecución del engine con varias reglas y casos típicos.  
- **Benchmarks**: tiempo por regla y por *batch* (publicar P50/P95/P99).

## Observabilidad (OTEL)

- Span por regla (`rule_name`, `periodo`, `agente_id`, `dur_ms`).  
- Métricas: histograma `rules.latency_ms{rule_name}` y contador de ejecuciones/errores.  
- Logs estructurados con `request-id`/`tenant-id` para correlación.

## Auditoría

- Guardar **LiquidacionSnapshot** con `contextHash` (parámetros + entradas) y `resultadoJson`.  
- **AuditLog** para cambios en parámetros/versiones que afecten cálculos futuros.
