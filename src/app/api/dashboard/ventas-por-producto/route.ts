
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const productos = await prisma.producto.findMany({
    where: {
      activo: true,
    },
    select: {
      id: true,
      nombre: true,
      unidad: true,
    },
  });

  const ventas = await prisma.venta.groupBy({
    by: ["productoId"],
    _sum: {
      cantidad: true,
      total: true,
    },
  });

  const resultado = productos
    .map((producto) => {
      const venta = ventas.find(
        (v) => v.productoId === producto.id
      );

      return {
        productoId: producto.id,
        producto: producto.nombre,
        unidad: producto.unidad,
        cantidadVendida:
          venta?._sum.cantidad?.toString() ?? "0",
        totalVendido:
          venta?._sum.total?.toString() ?? "0",
      };
    })
    .sort(
      (a, b) =>
        Number(b.cantidadVendida) -
        Number(a.cantidadVendida)
    );

  return NextResponse.json(resultado);
}

