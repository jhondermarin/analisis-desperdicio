
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const ventas = await prisma.venta.groupBy({
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
        in: ventas.map((venta) => venta.productoId),
        },
    },
    select: {
        id: true,
        nombre: true,
    },
    });

    const resultado = ventas.map((venta) => {
    const producto = productos.find(
        (p) => p.id === venta.productoId
    );

    return {
        productoId: venta.productoId,
        producto: producto?.nombre ?? "Sin nombre",
        cantidadVendida: venta._sum.cantidad?.toString() ?? "0",
        totalVendido: venta._sum.total?.toString() ?? "0",
    };
    });

    return NextResponse.json(resultado);

}
