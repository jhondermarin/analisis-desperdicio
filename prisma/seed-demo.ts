import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const productos = [
  { nombre: "Cerveza de barril", categoria: "Bebidas", unidad: "l", coste: 1.90, precio: 4.80 },
  { nombre: "Refresco de cola", categoria: "Bebidas", unidad: "ud", coste: 0.80, precio: 2.50 },
  { nombre: "Harina de trigo", categoria: "Panadería", unidad: "kg", coste: 1.20, precio: 2.50 },
  { nombre: "Pechuga de pollo", categoria: "Carnes", unidad: "kg", coste: 5.50, precio: 9.50 },
  { nombre: "Leche entera", categoria: "Lácteos", unidad: "l", coste: 0.95, precio: 1.80 },
  { nombre: "Tomates frescos", categoria: "Verduras y frutas", unidad: "kg", coste: 1.60, precio: 3.20 },
] as const;

async function main() {
  for (const item of productos) {
    const categoria = await prisma.categoria.findUniqueOrThrow({
      where: { nombre: item.categoria },
    });

    const existente = await prisma.producto.findFirst({
      where: { nombre: item.nombre, categoriaId: categoria.id },
    });

    if (!existente) {
      await prisma.producto.create({
        data: {
          nombre: item.nombre,
          categoriaId: categoria.id,
          unidad: item.unidad,
          costeUnitario: item.coste,
          precioVenta: item.precio,
        },
      });
    }
  }

  console.log("Productos de demostración creados.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
