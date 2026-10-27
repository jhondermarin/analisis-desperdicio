import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const fechaDesde = searchParams.get("fechaDesde");
    const fechaHasta = searchParams.get("fechaHasta");


    const esFechaValida = (valor: string | null): boolean => {
    if (valor === null) return true;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
        return false;
    }

    const fecha = new Date(`${valor}T00:00:00.000Z`);

    return (
        !Number.isNaN(fecha.getTime()) &&
        fecha.toISOString().slice(0, 10) === valor
    );
    };

    if (!esFechaValida(fechaDesde) || !esFechaValida(fechaHasta)) {
    return NextResponse.json(
        { error: "Formato de fecha inválido. Usa YYYY-MM-DD." },
        { status: 400 },
    );
    }


    if (
    fechaDesde !== null &&
    fechaHasta !== null &&
    fechaDesde > fechaHasta
    ) {
    return NextResponse.json(
        {
        error: "La fecha inicial no puede ser posterior a la fecha final.",
        },
        { status: 400 },
    );
    }


    const filtroFecha = {
    ...(fechaDesde !== null
        ? { gte: new Date(`${fechaDesde}T00:00:00.000Z`) }
        : {}),
    ...(fechaHasta !== null
        ? { lte: new Date(`${fechaHasta}T00:00:00.000Z`) }
        : {}),
    };


  const grupos = await prisma.desperdicio.groupBy({
    by: ["productoId"],
    where: {
      fecha: filtroFecha,
    },
    _sum: {
      cantidad: true,
      costeTotal: true,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _sum: {
        costeTotal: "desc",
      },
    },
  });


    const productos = await prisma.producto.findMany({
    where: {
        id: {
        in: grupos.map((grupo) => grupo.productoId),
        },
    },
    select: {
        id: true,
        nombre: true,
    },
    });

    const nombresProductos = new Map(
    productos.map((producto) => [producto.id, producto.nombre]),
    );


  return NextResponse.json(
    grupos.map((grupo) => ({
      productoId: grupo.productoId,
      producto: nombresProductos.get(grupo.productoId) ?? null,
      cantidadRegistros: grupo._count.id,
      cantidadDesperdiciada:
        grupo._sum.cantidad?.toString() ?? "0",
      costeTotal:
        grupo._sum.costeTotal?.toString() ?? "0",
    })),
  );
}
