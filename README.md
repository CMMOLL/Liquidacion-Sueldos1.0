
# Sistema de Liquidación Educativa – San Juan

Plataforma **auditable** para liquidación de sueldos docentes en la Provincia de San Juan. Enfocada en **cumplimiento normativo**, **trazabilidad** y **escalabilidad** del motor de cálculo, con salidas compatibles con **AFIP (Libro de Sueldos Digital)**, **bancos** y **formatos ofimáticos** (CSV/XLSX/PDF).

> **Stack**: Node.js LTS + **TypeScript**, **NestJS**, **PostgreSQL** (Prisma), **Redis/BullMQ**, **OpenTelemetry**, **Pino**, **React TS** (UI), **Docker**.  
> **Arquitectura**: Monolito modular con *bounded contexts* (módulos), *engine* de reglas extensible y canales de salida (drivers).

---

## 🧭 Tabla de contenidos
- [Quickstart](#-quickstart)
- [Estructura del repo](#-estructura-del-repo)
- [Scripts útiles](#-scripts-útiles)
- [Configuración y entornos](#-configuración-y-entornos)
- [Testing y Benchmarks](#-testing-y-benchmarks)
- [Observabilidad](#-observabilidad)
- [Seguridad](#-seguridad)
- [Arquitectura y Módulos](#-arquitectura-y-módulos)
  - [Reglas e Inmutabilidad](#reglas-e-inmutabilidad)
  - [Separación de Drivers de Salida](#separación-de-drivers-de-salida)
- [Auditoría y Trazabilidad](#-auditoría-y-trazabilidad)
- [Performance y Operaciones](#-performance-y-operaciones)
- [Retroactivos](#-retroactivos)
- [Multi-tenant](#-multi-tenant)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## 🚀 Quickstart

### Opción A: con **Make** (recomendada)
```bash
make dev           # levanta Postgres/Redis y API en watch
make test          # unit
make test-int      # integración
make test-e2e      # end-to-end
make bench         # benchmarks de reglas y engine
make db-reset      # resetea DB y vuelve a migrar + seed
```

### Opción B: comandos crudos
```bash
docker compose up -d         # Arranca Postgres y Redis
pnpm install                 # o npm i
pnpm prisma:migrate:dev      # crea/actualiza esquema local
pnpm seed                    # datos mínimos de arranque (opcional)
pnpm dev                     # API en modo watch (http://localhost:3000)
# UI (si aplica): cd apps/web && pnpm dev  # http://localhost:5173
```

### Health y docs
- **Healthcheck**: `GET http://localhost:3000/health`
- **Swagger/OpenAPI**: `http://localhost:3000/docs` (si está habilitado)

---

## 🧱 Estructura del repo
> Organización orientada a **mantenibilidad**, **testabilidad** y **dominios** claros.

```
Liquidacion-Sueldos1.0/
├─ apps/
│  ├─ api/                   # NestJS (API y motor de reglas)
│  │  ├─ src/
│  │  │  ├─ core/            # dominio común (domain, infra, utils)
│  │  │  ├─ modules/
│  │  │  │  ├─ agente/       # agentes/legajos
│  │  │  │  ├─ designacion/  # designaciones y radios
│  │  │  │  ├─ parametros/   # índices, nomencladores, multiplicadores
│  │  │  │  ├─ concepto/     # conceptos remunerativos/no remunerativos
│  │  │  │  ├─ liquidacion/  # engine (rules/, services/, presenters/)
│  │  │  │  └─ output/       # afip/, bancos/, planillas/, recibos/
│  │  │  └─ main.ts
│  │  ├─ test/               # unit, integration, e2e
│  │  └─ prisma/
│  └─ web/                   # (opcional) App React TS
├─ docs/                     # documentación extendida
│  ├─ Arquitectura.md
│  ├─ Modulos.md
│  ├─ EngineRules.md
│  ├─ Output-Integraciones.md
│  ├─ Testing-CI-CD.md
│  ├─ Observabilidad.md
│  ├─ Seguridad.md
│  ├─ Retroactivos.md
│  ├─ Datos-Modelo.md
│  └─ ADR/ADR-0001.md
├─ prisma/
│  ├─ schema.prisma
│  ├─ audit_models.prisma
│  └─ migrations/
├─ .github/
│  ├─ workflows/ci.yml
│  └─ ISSUE_TEMPLATE/
├─ .editorconfig
├─ .eslintignore
├─ .eslintrc.cjs
├─ .prettierrc
├─ .dockerignore
├─ Dockerfile
├─ docker-compose.yml
├─ package.json
├─ pnpm-lock.yaml
├─ .env.sample
├─ CONTRIBUTING.md
├─ SECURITY.md
├─ CODE_OF_CONDUCT.md
├─ LICENSE
└─ README.md
```

---

## 🧩 Scripts útiles

```jsonc
// package.json (extracto sugerido)
{
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start": "node dist/main.js",
    "lint": "eslint . --ext .ts",
    "fmt": "prettier --write .",
    "typecheck": "tsc --noEmit",
    "test": "jest --runInBand",
    "test:int": "jest --config jest.int.config.ts",
    "test:e2e": "playwright test",
    "bench": "vitest bench",
    "prisma:studio": "prisma studio",
    "prisma:migrate:dev": "prisma migrate dev",
    "seed": "ts-node prisma/seed.ts"
  }
}
```
> Recomendado: **Husky** + **lint-staged** en *pre-commit*/*pre-push*.

---

## ⚙️ Configuración y entornos

Variables mínimas en `.env` (ver `.env.sample`):

```
APP_ENV=local|staging|prod
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/liquidacion
# Read replicas (reportes/históricos)
READ_DB_URL=postgresql://user:pass@read-replica:5432/liquidacion
REDIS_URL=redis://localhost:6379
JWT_SECRET=CAMBIAR_ESTE_SECRETO
SWAGGER_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
LOG_LEVEL=info
# Multi-tenant
TENANT_STRATEGY=header # header|subdomain
TENANT_HEADER=X-Institucion-Id
```

**Buenas prácticas**  
- No commitear `.env`. Proveer **`.env.sample`** actualizado.  
- Migraciones transaccionales (Prisma) en despliegues.  
- Secret manager del proveedor para credenciales.  
- **Encriptación en reposo** (TDE/pgcrypto) para datos sensibles (ver `docs/Seguridad.md`).

---

## 🧪 Testing y Benchmarks

- **Unit** (Jest/Vitest): reglas puras en `modules/liquidacion/engine/rules` (incluye *property-based* con `fast-check` para casos límite).  
- **Integración**: servicios + repositorios con Postgres de test (Docker).  
- **E2E** (Playwright): flujos *crear agente → asignar designación → liquidar → generar salidas*.  
- **Benchmarks** (Vitest bench): *profiling* de reglas y engine; publicar artefacto en CI.

> Ejemplos de *property-based* en `test/liquidacion/rules/antiguedad.property.spec.ts`

---

## 📈 Observabilidad

- **Logs** estructurados (**Pino**) con *request-id* y *tenant-id*.  
- **Trazas** y **métricas** con **OpenTelemetry** (OTLP → collector).  
- Span por **regla** (`rule_name`, `periodo`, `agente_id`, `dur_ms`).  
- Dashboards: *latencia de reglas*, *errores por driver*, *tiempo/tamaño exportaciones*, *reintentos/lag de colas*.

---

## 🔐 Seguridad

- **OWASP Top 10**, DTOs + `class-validator`, *rate-limiting*, *helmet*, CORS mínimo.  
- **RBAC** granular (ver `src/security/permissions.ts`). **Segregation of Duties** en endpoints críticos.  
- **Datos sensibles** cifrados (AES-GCM / pgcrypto). Enmascarado en logs.  
- **Rotación de secretos** (JWT, DB).  
- Validaciones previas a **AFIP LSD** (ver `src/modules/output/afip/afip.validator.ts`).  
- Detalle ampliado en `docs/Seguridad.md`.

---

## 🧠 Arquitectura y Módulos

**Estilo**: *Monolito modular* con límites claros por dominio.  
**Engine**: interfaz `ILiquidacionRule` (OCP) con **prioridad** y **contexto inmutable**; *presenters* para convertir salidas del motor a formatos externos.

### Reglas e Inmutabilidad
El contexto que consumen las reglas es **inmutable** (deep-freeze) para evitar *side-effects* y mejorar testeabilidad.

### Separación de Drivers de Salida
Los *drivers* de `output/` **solamente** dependen de **DTOs** expuestos por `liquidacion/presenters/` (DIP), nunca de dominios internos. Regla ESLint `no-restricted-imports` para reforzar.

---

## 🧾 Auditoría y Trazabilidad

- **Snapshots de liquidación inmutables** con `contextHash` y `resultadoJson`.  
- **AuditLog** para cambios en parámetros/tablas críticas (quién, qué, cuándo).  
- Ver `prisma/audit_models.prisma` y `docs/Datos-Modelo.md`.

---

## ⚡ Performance y Operaciones

- **Batching + cursor**; *chunks* por institución/periodo; checkpoints idempotentes.  
- **Caching** en Redis para parámetros por periodo (clave versionada).  
- **Read replicas** para reportes/históricos con manejo de **lag**.  
- **BullMQ** con *rate limiting* por driver y colas por institución.

Métricas: `rules.latency_ms{rule_name}`, `engine.throughput`, `output.export_ms/size_bytes`, `db.query_ms`, *hit ratio* del caché.

---

## 🔁 Retroactivos

- Flujo en `docs/Retroactivos.md` (as-of, ledger de deltas, estrategia **B: aplicar en presente** por defecto).  
- Estados: `BORRADOR` → `APROBADO` → `APLICADO`.  
- Export/conciliación con AFIP/bancos para diferencias.

---

## 🏫 Multi-tenant

- Estrategia por defecto: **RLS** en un único schema, filtrando por `institucionId`.  
- Middleware Prisma inyecta `tenantId` en todas las queries (ver `src/middleware/prismaTenant.ts`).  
- Alternativas: **schema-per-tenant** o **DB-per-tenant** (ver pros/cons en `docs/Seguridad.md`).

---

## 🤝 Contribuir

Ver [`CONTRIBUTING.md`](CONTRIBUTING.md) para estilo, commits, flujo de ramas y criterios de PR.  
Reportes de seguridad: [`SECURITY.md`](SECURITY.md). Código de conducta: [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia definida en [`LICENSE`](LICENSE).
