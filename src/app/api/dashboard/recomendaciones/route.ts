
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const compras = await prisma.compra.groupBy({
    by: ["productoId"],
    _sum: {
      cantidad: true,
    },
  });

  const ventas = await prisma.venta.groupBy({
    by: ["productoId"],
    _sum: {
      cantidad: true,
    },
  });

  const desperdicios = await prisma.desperdicio.groupBy({
    by: ["productoId"],
    _sum: {
      cantidad: true,
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



  const recomendaciones = compras.map((compra) => {
    const productoId = compra.productoId;
    const producto = productos.find(
    (p) => p.id === productoId
    );


    const cantidadComprada = Number(
      compra._sum.cantidad ?? 0
    );

    const venta = ventas.find(
      (v) => v.productoId === productoId
    );

    const desperdicio = desperdicios.find(
      (d) => d.productoId === productoId
    );

    const cantidadVendida = Number(
      venta?._sum.cantidad ?? 0
    );

    const cantidadDesperdiciada = Number(
      desperdicio?._sum.cantidad ?? 0
    );

    const porcentajeDesperdicio =
      cantidadComprada > 0
        ? (cantidadDesperdiciada / cantidadComprada) * 100
        : 0;

    return {
      productoId,
      producto: producto?.nombre ?? "Sin nombre",
      cantidadComprada,
      cantidadVendida,
      cantidadDesperdiciada,
      porcentajeDesperdicio:
        Number(porcentajeDesperdicio.toFixed(2)),
      recomendacion:
        porcentajeDesperdicio > 20
          ? "Revisar las cantidades compradas: el desperdicio supera el 20 %."
          : "No se detecta un desperdicio elevado según el umbral establecido.",
    };
  });

  return NextResponse.json(recomendaciones);

}
