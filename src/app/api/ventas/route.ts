
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ventaSchema } from "@/lib/validaciones/venta";
import { leerYValidarJson } from "@/lib/validaciones/validar-request";
import { errorJson } from "@/lib/http";

export async function POST(request: NextRequest) {
  // 1. Leer y validar los datos recibidos
  const resultado = await leerYValidarJson(request, ventaSchema);

  if (!resultado.ok) {
    return resultado.response;
  }

  const { fecha, productoId, cantidad, importacionId } =
    resultado.data;

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

  // 3. Comprobar que el producto está activo
  if (!producto.activo) {
    return errorJson(
      400,
      "Producto inactivo",
      "No se pueden registrar ventas de productos inactivos",
    );
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

  // 5. Calcular el total usando decimales exactos
  const cantidadDecimal = new Prisma.Decimal(cantidad);
  const precioUnitario = producto.precioVenta;

  const total = cantidadDecimal
    .mul(precioUnitario)
    .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

  // 6. Guardar la venta
  const venta = await prisma.venta.create({
    data: {
      fecha: new Date(`${fecha}T00:00:00.000Z`),
      productoId,
      cantidad: cantidadDecimal,
      precioUnitario,
      total,
      importacionId: importacionId ?? null,
    },
  });

  return NextResponse.json(venta, { status: 201 });
}




export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const productoIdTexto = searchParams.get("productoId");
  const fechaDesdeTexto = searchParams.get("fechaDesde");
  const fechaHastaTexto = searchParams.get("fechaHasta");

  // Validar el filtro de producto
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

  // Validar fechas reales en formato YYYY-MM-DD
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

  if (
    (fechaDesdeTexto !== null && !fechaValida(fechaDesdeTexto)) ||
    (fechaHastaTexto !== null && !fechaValida(fechaHastaTexto))
  ) {
    return errorJson(
      400,
      "Filtro inválido",
      "Las fechas deben ser válidas y tener formato YYYY-MM-DD",
    );
  }

  // Comprobar el orden del período
  if (
    fechaDesdeTexto !== null &&
    fechaHastaTexto !== null &&
    fechaDesdeTexto > fechaHastaTexto
  ) {
    return errorJson(
      400,
      "Filtro inválido",
      "fechaDesde no puede ser posterior a fechaHasta",
    );
  }

  // Construir los filtros de Prisma
  const where: Prisma.VentaWhereInput = {};

  if (productoId !== undefined) {
    where.productoId = productoId;
  }

  if (fechaDesdeTexto !== null || fechaHastaTexto !== null) {
    where.fecha = {
      ...(fechaDesdeTexto !== null
        ? { gte: new Date(`${fechaDesdeTexto}T00:00:00.000Z`) }
        : {}),
      ...(fechaHastaTexto !== null
        ? { lte: new Date(`${fechaHastaTexto}T00:00:00.000Z`) }
        : {}),
    };
  }

  const ventas = await prisma.venta.findMany({
    where,
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
    },
  });

  return NextResponse.json(ventas);
}
