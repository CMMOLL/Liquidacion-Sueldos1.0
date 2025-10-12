// prisma/seed.cjs
/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Poné acá tu lógica de seed. Ejemplos mínimos:
 * - Si ya tenés seed.ts, copiá y pegá su contenido acá (sin types ni imports ESM).
 */
async function main() {
  // Ejemplo: crear una Institución si no existe
  await prisma.institucion.upsert({
    where: { cuit: '30-00000000-7' },
    update: {},
    create: {
      nombre: 'Institución Demo',
      cuit: '30-00000000-7',
      // ...otros campos requeridos por tu schema
    },
  });

  // TODO: insertar ParametroBase, Concepto, Agente, Designacion, etc.
}

main()
  .then(() => console.log('✅ Seed ejecutado con éxito'))
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
