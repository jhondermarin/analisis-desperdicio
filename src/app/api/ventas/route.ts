
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
