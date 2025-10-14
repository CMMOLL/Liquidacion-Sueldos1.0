
import fc from 'fast-check';
// Ajusta los imports a tu estructura real:
import { calcularMesesAntiguedad, calcularAdicionalAntiguedad } from '../../../apps/api/src/modules/liquidacion/engine/antiguedad';

describe('AntiguedadRule - Property Based', () => {
  it('antigüedad nunca puede ser negativa', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('1970-01-01') }),
        fc.date({ min: new Date('2000-01-01') }),
        (fechaIngreso, fechaCalculo) => {
          const meses = calcularMesesAntiguedad(fechaIngreso, fechaCalculo);
          expect(meses).toBeGreaterThanOrEqual(0);
        }
      )
    );
  });

  it('adicional por antigüedad crece monotónicamente', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 600 }), // meses
        fc.float({ min: 1000, max: 100000 }), // sueldo base
        (meses, sueldoBase) => {
          const a1 = calcularAdicionalAntiguedad(meses, sueldoBase);
          const a2 = calcularAdicionalAntiguedad(meses + 1, sueldoBase);
          expect(a2).toBeGreaterThanOrEqual(a1);
        }
      )
    );
  });
});
