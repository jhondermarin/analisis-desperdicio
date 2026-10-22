
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { compraSchema } from "@/lib/validaciones/compra";
import { leerYValidarJson } from "@/lib/validaciones/validar-request";
import { errorJson } from "@/lib/http";

export async function POST(request: NextRequest) {
  // 1. Leer y validar el JSON recibido
  const resultado = await leerYValidarJson(request, compraSchema);

  if (!resultado.ok) {
    return resultado.response;
  }

  const {
    fecha,
    productoId,
    proveedorId,
    cantidad,
    importacionId,
  } = resultado.data;

  // 2. Comprobar que el producto existe
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

  // 3. Comprobar el proveedor, si se ha indicado
  if (proveedorId != null) {
    const proveedor = await prisma.proveedor.findUnique({
      where: { id: proveedorId },
    });

    if (!proveedor) {
      return errorJson(
        404,
        "Proveedor no encontrado",
        "No existe un proveedor con el ID indicado",
      );
    }
  }

  // 4. Comprobar la importación, si se ha indicado
  if (importacionId != null) {
    const importacion = await prisma.importacion.findUnique({
      where: { id: importacionId },
    });

    if (!importacion) {
      return errorJson(
        404,
        "Importación no encontrada",
        "No existe una importación con el ID indicado",
      );
    }
  }

  // 5. Calcular el importe de la compra
  const cantidadDecimal = new Prisma.Decimal(cantidad);
  const costeUnitario = producto.costeUnitario;

  const total = cantidadDecimal
    .mul(costeUnitario)
    .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

  // 6. Registrar la compra en PostgreSQL
  const compra = await prisma.compra.create({
    data: {
      fecha: new Date(`${fecha}T00:00:00.000Z`),
      productoId,
      proveedorId: proveedorId ?? null,
      cantidad: cantidadDecimal,
      costeUnitario,
      total,
      importacionId: importacionId ?? null,
    },
  });

  // 7. Devolver la compra creada
  return NextResponse.json(compra, { status: 201 });
}




export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const productoIdTexto = searchParams.get("productoId");

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

  
const proveedorIdTexto = searchParams.get("proveedorId");

let proveedorId: number | undefined;

if (proveedorIdTexto !== null) {
  proveedorId = Number(proveedorIdTexto);

  if (
    proveedorIdTexto.trim() === "" ||
    !Number.isSafeInteger(proveedorId) ||
    proveedorId <= 0
  ) {
    return errorJson(
      400,
      "Filtro inválido",
      "proveedorId debe ser un número entero positivo",
    );
  }
}


const fechaDesdeTexto = searchParams.get("fechaDesde");
const fechaHastaTexto = searchParams.get("fechaHasta");

function validarFecha(valor: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return null;
  }

  const fecha = new Date(`${valor}T00:00:00.000Z`);

  if (
    Number.isNaN(fecha.getTime()) ||
    fecha.toISOString().slice(0, 10) !== valor
  ) {
    return null;
  }

  return fecha;
}

const fechaDesde =
  fechaDesdeTexto !== null
    ? validarFecha(fechaDesdeTexto)
    : undefined;

const fechaHasta =
  fechaHastaTexto !== null
    ? validarFecha(fechaHastaTexto)
    : undefined;

if (fechaDesde === null || fechaHasta === null) {
  return errorJson(
    400,
    "Filtro inválido",
    "Las fechas deben ser válidas y tener formato YYYY-MM-DD",
  );
}

if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
  return errorJson(
    400,
    "Filtro inválido",
    "fechaDesde no puede ser posterior a fechaHasta",
  );
}


const compras = await prisma.compra.findMany({
    where: {
    ...(productoId !== undefined ? { productoId } : {}),
    ...(proveedorId !== undefined ? { proveedorId } : {}),
    ...(fechaDesde || fechaHasta
        ? {
            fecha: {
            ...(fechaDesde ? { gte: fechaDesde } : {}),
            ...(fechaHasta ? { lte: fechaHasta } : {}),
            },
        }
        : {}),
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
      proveedor: {
        select: {
          id: true,
          nombre: true,
        },
      },
    },
  });

  return NextResponse.json(compras);
}

