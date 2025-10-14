// apps/api/src/modules/liquidacion/engine/RuleRegistry.ts
import { ILiquidacionRule } from './ILiquidacionRule';

export class RuleRegistry {
  private rules: ILiquidacionRule[] = [];

  register(rule: ILiquidacionRule) {
    this.rules.push(rule);
    this.rules.sort((a, b) => a.priority - b.priority);
  }

  list() {
    return [...this.rules];
  }
}
