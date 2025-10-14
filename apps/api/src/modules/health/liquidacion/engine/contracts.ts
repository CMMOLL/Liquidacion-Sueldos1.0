// apps/api/src/modules/liquidacion/engine/contracts.ts

export type ConceptoTipo = 'REM' | 'NR' | 'DESC';

export interface LiquidacionInput {
  periodo: string;        // "YYYY-MM"
  agenteId: string;
  institucionId: string;
  fechaCorte: Date;
  novedades?: Record<string, unknown>;
}

export interface ItemCalculado {
  conceptoId: string;
  tipo: ConceptoTipo;
  importe: string;        // decimal string para evitar floats
  base?: string;          // explicación base de cálculo
  meta?: Record<string, unknown>;
}

export interface Totales {
  remunerativo: string;
  noRemunerativo: string;
  descuentos: string;
  neto: string;
}

export interface DistribucionFuente {
  provincia: string;   // aporte empleador según % subvención
  institucion: string; // 1 - % subvención
}

export interface LiquidacionResult {
  agenteId: string;
  periodo: string;
  items: ItemCalculado[];
  totales: Totales;
  distribucion?: Record<string, DistribucionFuente>; // por conceptoId
  trazabilidad: {
    parametrosId: string;
    hashInput: string;
  };
}

export interface Designacion {
  id: string;
  institucionId: string;
  agenteId: string;
  cargoCodigo: string;
  vigenteDesde: Date;
  vigenteHasta: Date | null;
  porcentajeSubvencion: string; // decimal string 0..1 historizado
  categoriaPuntos: string;      // decimal string
}

export interface ParametroBaseVigente {
  id: string;
  periodo: string;
  valorPunto: string; // decimal string
  // … otros parámetros (topes, mínimos, etc.)
}

export interface EngineContext {
  parametros: ParametroBaseVigente;
  designaciones: Designacion[];
  cache: Map<string, unknown>;
}
