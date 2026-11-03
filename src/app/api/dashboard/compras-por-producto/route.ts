
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const compras = await prisma.compra.groupBy({
    by: ["productoId"],
    _sum: {
      cantidad: true,
      total: true,
    },
    orderBy: {
      _sum: {
        cantidad: "desc",
      },
    },
  });

  const productos = await prisma.producto.findMany({
    where: {
      id: {
        in: compras.map((compra) => compra.productoId),
      },
    },
    select: {
      id: true,
      nombre: true,
    },
  });

  const resultado = compras.map((compra) => {
    const producto = productos.find(
      (p) => p.id === compra.productoId
    );

    return {
      productoId: compra.productoId,
      producto: producto?.nombre ?? "Sin nombre",
      cantidadComprada:
        compra._sum.cantidad?.toString() ?? "0",
      totalComprado:
        compra._sum.total?.toString() ?? "0",
    };
  });

  return NextResponse.json(resultado);
}
