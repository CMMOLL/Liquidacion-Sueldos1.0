// apps/api/src/modules/liquidacion/engine/EngineService.ts
import crypto from 'node:crypto';
import { Injectable } from '@nestjs/common';
import {
  EngineContext,
  ItemCalculado,
  LiquidacionInput,
  LiquidacionResult,
} from './contracts';
import { RuleRegistry } from './RuleRegistry';

@Injectable()
export class EngineService {
  constructor(private readonly registry: RuleRegistry) {}

  async liquidar(input: LiquidacionInput, ctx: EngineContext): Promise<LiquidacionResult> {
    const rules = this.registry.list();
    const items: ItemCalculado[] = [];

    for (const rule of rules) {
      // Si alguna designación aplica, ejecutamos
      const aplica = ctx.designaciones.some(d => rule.aplicaA(d));
      if (!aplica) continue;

      const item = rule.ejecutar(input, ctx);
      if (item) items.push(item);
    }

    const totales = this.calcularTotales(items);
    const distribucion = this.distribuirPorSubvencion(items, ctx);

    const hashInput = crypto
      .createHash('sha256')
      .update(JSON.stringify({ input, ctx: { parametros: ctx.parametros.id } }))
      .digest('hex');

    return {
      agenteId: input.agenteId,
      periodo: input.periodo,
      items,
      totales,
      distribucion,
      trazabilidad: {
        parametrosId: ctx.parametros.id,
        hashInput,
      },
    };
  }

  private calcularTotales(items: ItemCalculado[]) {
    const sum = (arr: string[]) =>
      arr.reduce((a, b) => (BigInt(a) + BigInt(b)).toString(), '0');

    // trabajamos en centavos para evitar errores binarios
    const toCents = (s: string) => (s.includes('.') ? s.replace('.', '') : s) + ''.padStart(0, ''); // asume dos decimales ya limpios
    const fromCents = (c: string) => {
      const n = c.replace('-', '');
      const res = (n.length <= 2 ? '0.' + n.padStart(2, '0') : n.slice(0, -2) + '.' + n.slice(-2));
      return c.startsWith('-') ? '-' + res : res;
    };

    const rem  = sum(items.filter(i => i.tipo === 'REM').map(i => toCents(i.importe)));
    const nr   = sum(items.filter(i => i.tipo === 'NR').map(i => toCents(i.importe)));
    const desc = sum(items.filter(i => i.tipo === 'DESC').map(i => toCents(i.importe)));
    const neto = (BigInt(rem) + BigInt(nr) + BigInt(desc)).toString(); // desc en negativo

    return {
      remunerativo: fromCents(rem),
      noRemunerativo: fromCents(nr),
      descuentos: fromCents(desc),
      neto: fromCents(neto),
    };
  }

  /** Distribuye cada concepto entre Provincia e Institución según % subvención vigente */
  private distribuirPorSubvencion(items: ItemCalculado[], ctx: EngineContext) {
    const dist: Record<string, { provincia: string; institucion: string }> = {};

    // Tomamos el % de la primera designación aplicable (si hay varias, se puede prorratear por horas/cargos más adelante)
    const d = ctx.designaciones[0];
    if (!d) return dist;

    const toCents = (s: string) => (s.includes('.') ? s.replace('.', '') : s);
    const fromCents = (c: string) => {
      const n = c.replace('-', '');
      const res = (n.length <= 2 ? '0.' + n.padStart(2, '0') : n.slice(0, -2) + '.' + n.slice(-2));
      return c.startsWith('-') ? '-' + res : res;
    };

    const sub = d.porcentajeSubvencion; // "0.80" por ejemplo
    const subInt = Math.round(parseFloat(sub) * 10000); // 4 decimales para más precisión
    const oneInt = 10000;

    for (const it of items) {
      const cents = BigInt(toCents(it.importe));
      const provCents = (cents * BigInt(subInt)) / BigInt(oneInt);
      const instCents = cents - provCents;
      dist[it.conceptoId] = {
        provincia: fromCents(provCents.toString()),
        institucion: fromCents(instCents.toString()),
      };
    }
    return dist;
  }
}
