// apps/api/src/modules/liquidacion/engine/rules/DescJubilatorioRule.ts
import { ILiquidacionRule } from '../ILiquidacionRule';
import { EngineContext, ItemCalculado, LiquidacionInput } from '../contracts';

export class DescJubilatorioRule implements ILiquidacionRule {
  conceptoId = 'D01_JUB';
  priority = 90;

  aplicaA() { return true; }

  ejecutar(input: LiquidacionInput, ctx: EngineContext): ItemCalculado | null {
    // ejemplo: 14% sobre remunerativos
    const porcentaje = 0.14;
    const sumRem = (items: ItemCalculado[]) =>
      items.filter(i => i.tipo === 'REM')
        .reduce((acc, it) => acc + parseFloat(it.importe), 0);

    // En un engine real, para ver REM anteriores necesitamos que el EngineService
    // pase los items ya calculados. Aquí lo resolvemos re-calculando o inyectando por ctx.cache
    const totalRem = parseFloat(ctx.cache.get('TOTAL_REM') as string ?? '0');
    if (!totalRem) return null;

    const imp = -(totalRem * porcentaje);
    return {
      conceptoId: this.conceptoId,
      tipo: 'DESC',
      importe: imp.toFixed(2),
      base: `-${porcentaje * 100}% sobre REM(${totalRem.toFixed(2)})`,
    };
  }
}
