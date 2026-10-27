
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

  // Validar la fecha inicial
  if (!esFechaValida(fechaDesde)) {
    return errorJson(
      400,
      "Filtro inválido",
      "fechaDesde debe ser una fecha válida con formato YYYY-MM-DD",
    );
  }

  // Validar la fecha final
  if (!esFechaValida(fechaHasta)) {
    return errorJson(
      400,
      "Filtro inválido",
      "fechaHasta debe ser una fecha válida con formato YYYY-MM-DD",
    );
  }

  // Validar el intervalo de fechas
  if (!esRangoFechaValido(fechaDesde, fechaHasta)) {
    return errorJson(
      400,
      "Rango de fechas inválido",
      "fechaDesde no puede ser posterior a fechaHasta",
    );
  }

  // Construir el filtro de fechas
  const filtroFecha = {
    ...(fechaDesde !== null
      ? { gte: new Date(`${fechaDesde}T00:00:00.000Z`) }
      : {}),
    ...(fechaHasta !== null
      ? { lte: new Date(`${fechaHasta}T00:00:00.000Z`) }
      : {}),
  };

  const where = {
    fecha: filtroFecha,
  };

  // Calcular los totales de forma paralela
  const [ventas, compras, desperdicios] = await Promise.all([
    prisma.venta.aggregate({
      where,
      _sum: { total: true },
    }),

    prisma.compra.aggregate({
      where,
      _sum: { total: true },
    }),

    prisma.desperdicio.aggregate({
      where,
      _sum: { costeTotal: true },
    }),
  ]);

  const totalCompras = compras._sum.total;
  const totalDesperdicios = desperdicios._sum.costeTotal;

  // Calcular el porcentaje de desperdicio sobre compras
  const porcentajeDesperdicio =
    totalCompras && !totalCompras.isZero()
      ? totalDesperdicios
          ?.div(totalCompras)
          .mul(100)
          .toDecimalPlaces(2)
          .toString() ?? "0"
      : null;

  // Devolver el resumen económico
  return NextResponse.json({
    totalVentas: ventas._sum.total?.toString() ?? "0",
    totalCompras: compras._sum.total?.toString() ?? "0",
    totalDesperdicios:
      desperdicios._sum.costeTotal?.toString() ?? "0",
    porcentajeDesperdicio,
  });
}
