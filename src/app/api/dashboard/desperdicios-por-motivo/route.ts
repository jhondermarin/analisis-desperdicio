
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorJson } from "@/lib/http";
import {
  esFechaValida,
  esRangoFechaValido,
} from "@/lib/validaciones/fechas";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const fechaDesde = searchParams.get("fechaDesde");
  const fechaHasta = searchParams.get("fechaHasta");

  // Validar fecha inicial
  if (!esFechaValida(fechaDesde)) {
    return errorJson(
      400,
      "Filtro inválido",
      "fechaDesde debe ser una fecha válida con formato YYYY-MM-DD",
    );
  }

  // Validar fecha final
  if (!esFechaValida(fechaHasta)) {
    return errorJson(
      400,
      "Filtro inválido",
      "fechaHasta debe ser una fecha válida con formato YYYY-MM-DD",
    );
  }

  // Validar el orden del intervalo
  if (!esRangoFechaValido(fechaDesde, fechaHasta)) {
    return errorJson(
      400,
      "Rango de fechas inválido",
      "fechaDesde no puede ser posterior a fechaHasta",
    );
  }

  // Construir el filtro de fechas para Prisma
  const filtroFecha = {
    ...(fechaDesde !== null
      ? { gte: new Date(`${fechaDesde}T00:00:00.000Z`) }
      : {}),
    ...(fechaHasta !== null
      ? { lte: new Date(`${fechaHasta}T00:00:00.000Z`) }
      : {}),
  };

  // Agrupar los desperdicios por motivo
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

  // Obtener los nombres de los motivos
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

  // Relacionar cada ID con su nombre
  const nombresMotivos = new Map(
    motivos.map((motivo) => [motivo.id, motivo.nombre]),
  );

  // Devolver los resultados en formato JSON
  return NextResponse.json(
    grupos.map((grupo) => ({
      motivoId: grupo.motivoId,
      motivo: nombresMotivos.get(grupo.motivoId) ?? null,
      cantidadRegistros: grupo._count.id,
      costeTotal: grupo._sum.costeTotal?.toString() ?? "0",
    })),
  );
}
