import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categorias = [
  "Bebidas", "Carnes", "Pescados", "Verduras y frutas",
  "Lácteos", "Panadería", "Otros",
];

const motivos = [
  "Caducidad", "Rotura o accidente", "Error de pedido",
  "Sobreproducción", "Mala conservación", "Devolución del cliente", "Otro",
];

async function main() {
  for (const nombre of categorias) {
    await prisma.categoria.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  for (const nombre of motivos) {
    await prisma.motivoDesperdicio.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  console.log("Seed completado: categorías y motivos creados.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());