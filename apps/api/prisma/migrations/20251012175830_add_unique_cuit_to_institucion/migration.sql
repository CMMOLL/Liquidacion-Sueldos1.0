-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMIN', 'LIQUIDADOR', 'AUDITOR', 'LECTURA');

-- CreateEnum
CREATE TYPE "TipoDesignacion" AS ENUM ('CARGO', 'HCNM', 'HCNS', 'OTRO');

-- CreateEnum
CREATE TYPE "NivelEducativo" AS ENUM ('PRIMARIO', 'SECUNDARIO', 'SUPERIOR', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoConcepto" AS ENUM ('REM', 'NR', 'DESC', 'CONT');

-- CreateEnum
CREATE TYPE "AplicaA" AS ENUM ('DOCENTE', 'NO_DOCENTE', 'AMBOS');

-- CreateEnum
CREATE TYPE "EstadoLiquidacion" AS ENUM ('BORRADOR', 'VALIDADA', 'FINAL');

-- CreateEnum
CREATE TYPE "TipoNovedad" AS ENUM ('INASISTENCIA', 'LICENCIA', 'PREMIO', 'AJUSTE', 'OTRA');

-- CreateEnum
CREATE TYPE "ActorTipo" AS ENUM ('USUARIO', 'SISTEMA', 'JOB');

-- CreateEnum
CREATE TYPE "EntidadAuditada" AS ENUM ('AGENTE', 'DESIGNACION', 'PARAMETRO_BASE', 'CONCEPTO', 'LIQUIDACION', 'NOVEDAD', 'INSTITUCION', 'USUARIO');

-- CreateTable
CREATE TABLE "Institucion" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cuit" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institucion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agente" (
    "id" TEXT NOT NULL,
    "cuit" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Designacion" (
    "id" TEXT NOT NULL,
    "agenteId" TEXT NOT NULL,
    "institucionId" TEXT NOT NULL,
    "tipo" "TipoDesignacion" NOT NULL,
    "nivel" "NivelEducativo" NOT NULL,
    "horasOCargo" DECIMAL(10,2) NOT NULL,
    "porcentajeSubv" DECIMAL(5,2) NOT NULL,
    "vigenteDesde" TIMESTAMP(3) NOT NULL,
    "vigenteHasta" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Designacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistorialMovimientoDesignacion" (
    "id" TEXT NOT NULL,
    "designacionId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motivo" TEXT NOT NULL,
    "campo" TEXT,
    "valorAnterior" TEXT,
    "valorNuevo" TEXT,

    CONSTRAINT "HistorialMovimientoDesignacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicioPrevio" (
    "id" TEXT NOT NULL,
    "agenteId" TEXT NOT NULL,
    "institucion" TEXT NOT NULL,
    "desde" TIMESTAMP(3) NOT NULL,
    "hasta" TIMESTAMP(3) NOT NULL,
    "tipo" TEXT NOT NULL,

    CONSTRAINT "ServicioPrevio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParametroBase" (
    "id" TEXT NOT NULL,
    "vigenteDesde" TIMESTAMP(3) NOT NULL,
    "vigenteHasta" TIMESTAMP(3),
    "indiceDocente" DECIMAL(18,4) NOT NULL,
    "valorPuntoCct" DECIMAL(18,4) NOT NULL,
    "topes" JSONB,
    "alicuotas" JSONB,
    "reglasRedondeo" JSONB,
    "version" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParametroBase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Concepto" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoConcepto" NOT NULL,
    "aplicaA" "AplicaA" NOT NULL,
    "orden" INTEGER NOT NULL,
    "codigoAfip" TEXT,
    "regla" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Concepto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Novedad" (
    "id" TEXT NOT NULL,
    "agenteId" TEXT NOT NULL,
    "institucionId" TEXT,
    "tipo" "TipoNovedad" NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "porcentaje" DECIMAL(7,4),
    "monto" DECIMAL(18,4),
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Novedad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Liquidacion" (
    "id" TEXT NOT NULL,
    "agenteId" TEXT NOT NULL,
    "institucionId" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "estado" "EstadoLiquidacion" NOT NULL DEFAULT 'BORRADOR',
    "neto" DECIMAL(18,4) NOT NULL,
    "totales" JSONB,
    "trazabilidad" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Liquidacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemLiquidacion" (
    "id" TEXT NOT NULL,
    "liquidacionId" TEXT NOT NULL,
    "conceptoCodigo" TEXT NOT NULL,
    "tipo" "TipoConcepto" NOT NULL,
    "monto" DECIMAL(18,4) NOT NULL,
    "base" DECIMAL(18,4),
    "regla" TEXT NOT NULL,
    "detalles" JSONB,

    CONSTRAINT "ItemLiquidacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorTipo" "ActorTipo" NOT NULL,
    "actorId" TEXT,
    "entidad" "EntidadAuditada" NOT NULL,
    "entidadId" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "diff" JSONB,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Institucion_cuit_key" ON "Institucion"("cuit");

-- CreateIndex
CREATE INDEX "Institucion_nombre_idx" ON "Institucion"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Agente_cuit_key" ON "Agente"("cuit");

-- CreateIndex
CREATE UNIQUE INDEX "Agente_dni_key" ON "Agente"("dni");

-- CreateIndex
CREATE INDEX "Agente_apellido_nombre_idx" ON "Agente"("apellido", "nombre");

-- CreateIndex
CREATE INDEX "Agente_cuit_idx" ON "Agente"("cuit");

-- CreateIndex
CREATE INDEX "Agente_dni_idx" ON "Agente"("dni");

-- CreateIndex
CREATE INDEX "Designacion_agenteId_vigenteDesde_vigenteHasta_idx" ON "Designacion"("agenteId", "vigenteDesde", "vigenteHasta");

-- CreateIndex
CREATE INDEX "Designacion_institucionId_idx" ON "Designacion"("institucionId");

-- CreateIndex
CREATE INDEX "ServicioPrevio_agenteId_desde_hasta_idx" ON "ServicioPrevio"("agenteId", "desde", "hasta");

-- CreateIndex
CREATE INDEX "ParametroBase_vigenteDesde_vigenteHasta_idx" ON "ParametroBase"("vigenteDesde", "vigenteHasta");

-- CreateIndex
CREATE UNIQUE INDEX "ParametroBase_vigenteDesde_key" ON "ParametroBase"("vigenteDesde");

-- CreateIndex
CREATE UNIQUE INDEX "Concepto_codigo_key" ON "Concepto"("codigo");

-- CreateIndex
CREATE INDEX "Concepto_tipo_aplicaA_orden_idx" ON "Concepto"("tipo", "aplicaA", "orden");

-- CreateIndex
CREATE INDEX "Novedad_agenteId_fechaInicio_fechaFin_idx" ON "Novedad"("agenteId", "fechaInicio", "fechaFin");

-- CreateIndex
CREATE INDEX "Novedad_institucionId_idx" ON "Novedad"("institucionId");

-- CreateIndex
CREATE INDEX "Liquidacion_agenteId_periodo_idx" ON "Liquidacion"("agenteId", "periodo");

-- CreateIndex
CREATE INDEX "Liquidacion_institucionId_periodo_idx" ON "Liquidacion"("institucionId", "periodo");

-- CreateIndex
CREATE UNIQUE INDEX "Liquidacion_agenteId_institucionId_periodo_estado_key" ON "Liquidacion"("agenteId", "institucionId", "periodo", "estado");

-- CreateIndex
CREATE INDEX "ItemLiquidacion_liquidacionId_idx" ON "ItemLiquidacion"("liquidacionId");

-- CreateIndex
CREATE INDEX "ItemLiquidacion_conceptoCodigo_idx" ON "ItemLiquidacion"("conceptoCodigo");

-- CreateIndex
CREATE INDEX "AuditLog_entidad_entidadId_createdAt_idx" ON "AuditLog"("entidad", "entidadId", "createdAt");

-- AddForeignKey
ALTER TABLE "Designacion" ADD CONSTRAINT "Designacion_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "Agente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Designacion" ADD CONSTRAINT "Designacion_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "Institucion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialMovimientoDesignacion" ADD CONSTRAINT "HistorialMovimientoDesignacion_designacionId_fkey" FOREIGN KEY ("designacionId") REFERENCES "Designacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicioPrevio" ADD CONSTRAINT "ServicioPrevio_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "Agente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Novedad" ADD CONSTRAINT "Novedad_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "Agente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Novedad" ADD CONSTRAINT "Novedad_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "Institucion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Liquidacion" ADD CONSTRAINT "Liquidacion_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "Agente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Liquidacion" ADD CONSTRAINT "Liquidacion_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "Institucion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemLiquidacion" ADD CONSTRAINT "ItemLiquidacion_liquidacionId_fkey" FOREIGN KEY ("liquidacionId") REFERENCES "Liquidacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
