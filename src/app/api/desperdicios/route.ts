
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { desperdicioSchema } from "@/lib/validaciones/desperdicio";
import { leerYValidarJson } from "@/lib/validaciones/validar-request";
import { errorJson } from "@/lib/http";

export async function POST(request: NextRequest) {
  // 1. Leer y validar los datos recibidos
  const resultado = await leerYValidarJson(
    request,
    desperdicioSchema,
  );

  if (!resultado.ok) {
    return resultado.response;
  }

  const {
    fecha,
    productoId,
    motivoId,
    cantidad,
    notas,
  } = resultado.data;

  // 2. Comprobar que existe el producto
  const producto = await prisma.producto.findUnique({
    where: { id: productoId },
  });

  if (!producto) {
    return errorJson(
      404,
      "Producto no encontrado",
      "No existe un producto con el ID indicado",
    );
  }

  // 3. Comprobar que existe el motivo
  const motivo = await prisma.motivoDesperdicio.findUnique({
    where: { id: motivoId },
  });

  if (!motivo) {
    return errorJson(
      404,
      "Motivo no encontrado",
      "No existe un motivo de desperdicio con el ID indicado",
    );
  }

  // 4. Calcular el coste económico del desperdicio
  const cantidadDecimal = new Prisma.Decimal(cantidad);

  const costeTotal = cantidadDecimal
    .mul(producto.costeUnitario)
    .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

  // 5. Registrar el desperdicio
  const desperdicio = await prisma.desperdicio.create({
    data: {
      fecha: new Date(`${fecha}T00:00:00.000Z`),
      productoId,
      motivoId,
      cantidad: cantidadDecimal,
      costeTotal,
      notas: notas ?? null,
    },
  });

  // 6. Devolver el registro creado
  return NextResponse.json(desperdicio, {
    status: 201,
  });
}



export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const productoIdTexto = searchParams.get("productoId");
  const motivoIdTexto = searchParams.get("motivoId");
  const fechaDesde = searchParams.get("fechaDesde");
  const fechaHasta = searchParams.get("fechaHasta");

  let productoId: number | undefined;

  if (productoIdTexto !== null) {
    productoId = Number(productoIdTexto);

    if (
      productoIdTexto.trim() === "" ||
      !Number.isSafeInteger(productoId) ||
      productoId <= 0
    ) {
      return errorJson(
        400,
        "Filtro inválido",
        "productoId debe ser un número entero positivo",
      );
    }
  }

  let motivoId: number | undefined;

  if (motivoIdTexto !== null) {
    motivoId = Number(motivoIdTexto);

    if (
      motivoIdTexto.trim() === "" ||
      !Number.isSafeInteger(motivoId) ||
      motivoId <= 0
    ) {
      return errorJson(
        400,
        "Filtro inválido",
        "motivoId debe ser un número entero positivo",
      );
    }
  }

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


  const desperdicios = await prisma.desperdicio.findMany({
    where: {
    ...(productoId !== undefined ? { productoId } : {}),
    ...(motivoId !== undefined ? { motivoId } : {}),
    ...(
        fechaDesde !== null || fechaHasta !== null
        ? {
            fecha: {
                ...(fechaDesde !== null
                ? { gte: new Date(`${fechaDesde}T00:00:00.000Z`) }
                : {}),
                ...(fechaHasta !== null
                ? { lte: new Date(`${fechaHasta}T00:00:00.000Z`) }
                : {}),
            },
            }
        : {}
    ),
    },

    orderBy: [
      { fecha: "desc" },
      { id: "desc" },
    ],
    include: {
      producto: {
        select: {
          id: true,
          nombre: true,
          unidad: true,
        },
      },
      motivo: {
        select: {
          id: true,
          nombre: true,
        },
      },
    },
  });

  return NextResponse.json(desperdicios);
}