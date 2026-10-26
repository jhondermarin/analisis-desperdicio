
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorJson } from "@/lib/http";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const fechaDesde = searchParams.get("fechaDesde");
    const fechaHasta = searchParams.get("fechaHasta");


    function fechaValida(valor: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
        return false;
    }

    const fecha = new Date(`${valor}T00:00:00.000Z`);

    return (
        !Number.isNaN(fecha.getTime()) &&
        fecha.toISOString().slice(0, 10) === valor
    );
    }

    if (fechaDesde !== null && !fechaValida(fechaDesde)) {
    return errorJson(
        400,
        "Filtro inválido",
        "fechaDesde debe ser una fecha válida con formato YYYY-MM-DD",
    );
    }

    if (fechaHasta !== null && !fechaValida(fechaHasta)) {
    return errorJson(
        400,
        "Filtro inválido",
        "fechaHasta debe ser una fecha válida con formato YYYY-MM-DD",
    );
    }

    if (
    fechaDesde !== null &&
    fechaHasta !== null &&
    fechaDesde > fechaHasta
    ) {
    return errorJson(
        400,
        "Rango de fechas inválido",
        "fechaDesde no puede ser posterior a fechaHasta",
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
    by: ["motivoId"],
    where: {
      fecha: filtroFecha,
    },
    _sum: {
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


    const motivos = await prisma.motivoDesperdicio.findMany({
    where: {
        id: {
        in: grupos.map((grupo) => grupo.motivoId),
        },
    },
    select: {
        id: true,
        nombre: true,
    },
    });

    const nombresMotivos = new Map(
    motivos.map((motivo) => [motivo.id, motivo.nombre]),
    );

    return NextResponse.json(
    grupos.map((grupo) => ({
        motivoId: grupo.motivoId,
        motivo: nombresMotivos.get(grupo.motivoId) ?? null,
        cantidadRegistros: grupo._count.id,
        costeTotal: grupo._sum.costeTotal?.toString() ?? "0",
    })),
    );

}
