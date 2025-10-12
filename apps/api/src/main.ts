import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './shared/infra/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cierre ordenado ante señales del SO (sin devolver Promises en el callback)
  const prisma = app.get(PrismaService);

  process.on('SIGINT', () => {
    // Encapsulo la lógica async para no devolver Promise en el callback
    (async () => {
      try {
        await prisma.$disconnect();
        await app.close();
      } finally {
        process.exit(0);
      }
    })().catch((err) => {
      // Por las dudas, log y salida no-cero
      // eslint-disable-next-line no-console
      console.error('Error cerrando la app en SIGINT:', err);
      process.exit(1);
    });
  });

  process.on('SIGTERM', () => {
    (async () => {
      try {
        await prisma.$disconnect();
        await app.close();
      } finally {
        process.exit(0);
      }
    })().catch((err) => {
      // eslint-disable-next-line no-console
      console.error('Error cerrando la app en SIGTERM:', err);
      process.exit(1);
    });
  });

  await app.listen(3000);
}

// Manejo explícito de la promesa para que el linter no se queje
bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Error al iniciar la app:', err);
  process.exit(1);
});
