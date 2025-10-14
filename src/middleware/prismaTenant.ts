
/* Prisma middleware para inyectar tenantId en consultas find* */
import { Prisma } from '@prisma/client';
import { AsyncLocalStorage } from 'node:async_hooks';

// src/prisma/prisma.service.ts (ejemplo)
import { prismaTenantMiddleware } from '../middleware/prismaTenant';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    this.$use(prismaTenantMiddleware());
    await this.$connect();
  }
}

export const tenantStore = new AsyncLocalStorage<{ tenantId: string }>();

export function withTenant<T>(tenantId: string, fn: () => Promise<T>) {
  return tenantStore.run({ tenantId }, fn);
}

export function prismaTenantMiddleware(): Prisma.Middleware {
  return async (params, next) => {
    const store = tenantStore.getStore();
    if (!store?.tenantId) return next(params);

    // Inyectar tenantId en lecturas
    if (params.action === 'findMany' || params.action === 'findFirst') {
      params.args = params.args || {};
      params.args.where = {
        ...(params.args.where || {}),
        institucionId: store.tenantId,
      };
    }
    // En escrituras, asegurar el tenant
    if (['create', 'update', 'upsert'].includes(params.action)) {
      params.args.data = {
        ...(params.args.data || {}),
        institucionId: store.tenantId,
      };
    }

    return next(params);
  };
}
