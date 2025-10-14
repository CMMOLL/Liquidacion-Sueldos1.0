
import { PayoutBatchDTO } from '../../liquidacion/presenters/payout.dto';

export type ValidationResult = { valid: boolean; errors: string[] };

const NOMENCLADOR_AFIP = new Set<string>([/* ...códigos válidos... */]);

export class AfipLSDValidator {
  validate(batch: PayoutBatchDTO): ValidationResult {
    const errors: string[] = [];

    for (const l of batch.lineas) {
      if (!this.validarCUIL(l.agenteCUIL)) {
        errors.push(`CUIL inválido: ${l.agenteCUIL}`);
      }
      if (!NOMENCLADOR_AFIP.has(l.conceptoCodigo)) {
        errors.push(`Concepto no mapeado: ${l.conceptoCodigo}`);
      }
      if (l.importe == null || Number.isNaN(l.importe)) {
        errors.push(`Importe inválido en ${l.conceptoCodigo}`);
      }
    }

    // TODO: validar sumatorias, fechas dentro del período, etc.
    return { valid: errors.length === 0, errors };
  }

  private validarCUIL(cuil?: string): boolean {
    if (!cuil) return false;
    const digits = cuil.replace(/[^0-9]/g, '');
    if (digits.length !== 11) return false;
    const base = digits.slice(0, 10).split('').map(Number);
    const verif = Number(digits[10]);
    const multipliers = [5,4,3,2,7,6,5,4,3,2];
    const sum = base.reduce((acc, n, i) => acc + n * multipliers[i], 0);
    const mod = 11 - (sum % 11);
    const check = mod === 11 ? 0 : (mod === 10 ? 9 : mod);
    return check === verif;
  }
}
