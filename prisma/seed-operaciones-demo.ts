import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const fecha = new Date("2026-11-10T12:00:00.000Z");

const operaciones = [
  { producto: "Cerveza de barril", compra: 40, venta: 27, desperdicio: 10, motivo: "Caducidad" },
  { producto: "Refresco de cola", compra: 100, venta: 80, desperdicio: 3, motivo: "Rotura o accidente" },
  { producto: "Harina de trigo", compra: 50, venta: 12, desperdicio: 2, motivo: "Sobreproducción" },
  { producto: "Pechuga de pollo", compra: 30, venta: 18, desperdicio: 8, motivo: "Caducidad" },
  { producto: "Leche entera", compra: 60, venta: 45, desperdicio: 6, motivo: "Mala conservación" },
  { producto: "Tomates frescos", compra: 45, venta: 25, desperdicio: 12, motivo: "Mala conservación" },
];

async function main() {
  await prisma.$transaction(async (tx) => {
    const [ventas, compras, desperdicios] = await Promise.all([
      tx.venta.count(),
      tx.compra.count(),
      tx.desperdicio.count(),
    ]);

    if (ventas > 0 || compras > 0 || desperdicios > 0) {
      throw new Error(
        "Ya existen operaciones en esta base de datos. No se insertarán datos de demostración."
      );
    }

    for (const item of operaciones) {
      const producto = await tx.producto.findFirstOrThrow({
        where: { nombre: item.producto },
      });

      const motivo = await tx.motivoDesperdicio.findUniqueOrThrow({
        where: { nombre: item.motivo },
      });

      const coste = new Prisma.Decimal(producto.costeUnitario);
      const precio = new Prisma.Decimal(producto.precioVenta);

      await tx.compra.create({
        data: {
          fecha,
          productoId: producto.id,
          cantidad: item.compra,
          costeUnitario: coste,
          total: coste.mul(item.compra),
        },
      });

      await tx.venta.create({
        data: {
          fecha,
          productoId: producto.id,
          cantidad: item.venta,
          precioUnitario: precio,
          total: precio.mul(item.venta),
        },
      });

      await tx.desperdicio.create({
        data: {
          fecha,
          productoId: producto.id,
          motivoId: motivo.id,
          cantidad: item.desperdicio,
          costeTotal: coste.mul(item.desperdicio),
          notas: "Datos ficticios para demostración del proyecto",
        },
      });
    }
  });

  console.log("Operaciones de demostración creadas correctamente.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
