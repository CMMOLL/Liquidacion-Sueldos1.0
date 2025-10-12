import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/infra/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async dbOk() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { db: 'ok' };
  }
}
