// apps/api/src/modules/liquidacion/engine/rules/A01BaseRule.ts
import { ILiquidacionRule } from '../ILiquidacionRule';
import { EngineContext, ItemCalculado, LiquidacionInput } from '../contracts';

export class A01BaseRule implements ILiquidacionRule {
  conceptoId = 'A01_BASE';
  priority = 10;

  aplicaA() { return true; }

  ejecutar(input: LiquidacionInput, ctx: EngineContext): ItemCalculado | null {
    const d = ctx.designaciones[0];
    if (!d) return null;

    const puntos = parseFloat(d.categoriaPuntos);
    const valorPunto = parseFloat(ctx.parametros.valorPunto);
    const importe = (puntos * valorPunto).toFixed(2);

    return {
      conceptoId: this.conceptoId,
      tipo: 'REM',
      importe,
      base: `puntos(${puntos}) * valorPunto(${valorPunto})`,
    };
    }
}
