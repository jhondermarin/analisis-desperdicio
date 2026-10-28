
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

import {
  esFechaValida,
  esRangoFechaValido,
} from "@/lib/validaciones/fechas";

export async function GET(request: Request) {
  // 1. Obtener los filtros de fecha de la URL
  const { searchParams } = new URL(request.url);

  const fechaDesde = searchParams.get("fechaDesde");
  const fechaHasta = searchParams.get("fechaHasta");

  // 2. Validar el formato de las fechas
  if (!esFechaValida(fechaDesde) || !esFechaValida(fechaHasta)) {
    return NextResponse.json(
      { error: "Formato de fecha inválido. Usa YYYY-MM-DD." },
      { status: 400 },
    );
  }

  // 3. Comprobar que el rango sea correcto
  if (!esRangoFechaValido(fechaDesde, fechaHasta)) {
    return NextResponse.json(
      { error: "fechaDesde no puede ser posterior a fechaHasta." },
      { status: 400 },
    );
  }

  // 4. Construir el filtro para Prisma
  const filtroFecha = {
    ...(fechaDesde && {
      gte: new Date(`${fechaDesde}T00:00:00.000Z`),
    }),
    ...(fechaHasta && {
      lte: new Date(`${fechaHasta}T23:59:59.999Z`),
    }),
  };

  // 5. Consultar los desperdicios en PostgreSQL
  const desperdicios = await prisma.desperdicio.findMany({
    where: {
      fecha: filtroFecha,
    },
    select: {
      fecha: true,
      costeTotal: true,
    },
    orderBy: {
      fecha: "asc",
    },
  });

  // 6. Agrupar los costes por día
  const totalesPorDia = new Map<string, Prisma.Decimal>();

  for (const desperdicio of desperdicios) {
    const fecha = desperdicio.fecha.toISOString().slice(0, 10);

    const totalAnterior =
      totalesPorDia.get(fecha) ?? new Prisma.Decimal(0);

    totalesPorDia.set(
      fecha,
      totalAnterior.plus(desperdicio.costeTotal),
    );
  }

  // 7. Convertir los resultados a JSON
  const evolucion = Array.from(
    totalesPorDia,
    ([fecha, costeTotal]) => ({
      fecha,
      costeTotal: costeTotal.toString(),
    }),
  );

  return NextResponse.json(evolucion);
}
