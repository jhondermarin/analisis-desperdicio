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

    const where = {
    fecha: filtroFecha,
    };

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

const porcentajeDesperdicio =
  totalCompras && !totalCompras.isZero()
    ? totalDesperdicios
        ?.div(totalCompras)
        .mul(100)
        .toDecimalPlaces(2)
        .toString() ?? "0"
    : null;


  return NextResponse.json({
    totalVentas: ventas._sum.total?.toString() ?? "0",
    totalCompras: compras._sum.total?.toString() ?? "0",
    totalDesperdicios:
      desperdicios._sum.costeTotal?.toString() ?? "0",
    porcentajeDesperdicio,
  });
}
