
/**
 * Permisos granulares para RBAC y SoD.
 */
export enum Permiso {
  LIQUIDACION_CREAR = 'liquidacion:crear',
  LIQUIDACION_APROBAR = 'liquidacion:aprobar',
  LIQUIDACION_EXPORTAR_AFIP = 'liquidacion:exportar:afip',
  PARAMETROS_MODIFICAR = 'parametros:modificar',
  AUDITORIA_CONSULTAR = 'auditoria:consultar',
}
