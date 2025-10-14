// apps/api/src/modules/liquidacion/engine/ILiquidacionRule.ts
import { EngineContext, ItemCalculado, LiquidacionInput } from './contracts';

export interface ILiquidacionRule {
  conceptoId: string;  // mapea a Concepto.codigoInterno
  priority: number;    // orden de ejecución (menor = antes)
  aplicaA(designacion: EngineContext['designaciones'][number]): boolean;
  ejecutar(input: LiquidacionInput, ctx: EngineContext): ItemCalculado | null;
}
