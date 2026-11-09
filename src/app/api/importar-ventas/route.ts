
import { NextRequest, NextResponse } from "next/server";
import { ventaSchema } from "@/lib/validaciones/venta";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";


export async function POST(request: NextRequest) {
  const formulario = await request.formData();
  const archivo = formulario.get("archivo");

  if (!(archivo instanceof File)) {
    return NextResponse.json(
      { error: "Debes seleccionar un archivo CSV" },
      { status: 400 }
    );
  }

  const contenido = await archivo.text();
  const lineas = contenido.trim().split(/\r?\n/);

  if (lineas.length < 2) {
  return NextResponse.json(
    {
      error: "El archivo CSV debe contener encabezados y al menos una venta.",
    },
    { status: 400 }
  );
}

    const encabezados = lineas[0]
      .split(",")
      .map((columna) => columna.trim().replace(/^\uFEFF/, ""));

    const encabezadosEsperados = ["fecha", "productoId", "cantidad"];

    if (
      encabezados.length !== encabezadosEsperados.length ||
      !encabezadosEsperados.every(
        (encabezado, indice) => encabezados[indice] === encabezado
      )
    ) {
      return NextResponse.json(
        {
          error: "El CSV debe contener las columnas: fecha,productoId,cantidad, en ese orden.",
        },
        { status: 400 }
      );
  }

  // 1. Convertir las filas del CSV en ventas
  const ventas = lineas.slice(1).map((linea) => {
    const [fecha, productoId, cantidad] = linea.split(",");

    return {
      fecha,
      productoId: Number(productoId),
      cantidad,
    };
  });

  // 2. Validar cada venta
  const resultados = ventas.map((venta, indice) => {
    const validacion = ventaSchema.safeParse(venta);

    return {
      fila: indice + 2,
      valida: validacion.success,
      errores: validacion.success
        ? []
        : validacion.error.issues.map((error) => error.message),
    };
  });

  
    const hayErrores = resultados.some(
    (resultado) => !resultado.valida
    );

    if (hayErrores) {
    return NextResponse.json(
        {
        mensaje: "El CSV contiene errores. No se importó ninguna venta.",
        resultados,
        },
        { status: 400 }
    );
    }

    
    const productos = await prisma.producto.findMany({
    where: {
        id: {
        in: ventas.map((venta) => venta.productoId),
        },
    },
    });

    const productosInvalidos = ventas.filter((venta) => {
    const producto = productos.find(
        (p) => p.id === venta.productoId
    );

    return !producto || !producto.activo;
    });

    if (productosInvalidos.length > 0) {
    return NextResponse.json(
        {
        mensaje: "Hay productos inexistentes o inactivos en el CSV",
        productosInvalidos,
        },
        { status: 400 }
    );
    }

    
    const ventasPreparadas = ventas.map((venta) => {
    const producto = productos.find(
        (p) => p.id === venta.productoId
    )!;

    const cantidadDecimal = new Prisma.Decimal(venta.cantidad);
    const precioUnitario = producto.precioVenta;

    const total = cantidadDecimal
        .mul(precioUnitario)
        .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

    return {
        fecha: new Date(`${venta.fecha}T00:00:00.000Z`),
        productoId: venta.productoId,
        cantidad: cantidadDecimal,
        precioUnitario,
        total,
    };
    });


    const resultadoImportacion = await prisma.$transaction(async (tx) => {
      const importacion = await tx.importacion.create({
        data: {
          tipo: "ventas",
          archivo: archivo.name,
          filasOk: ventasPreparadas.length,
          filasError: 0,
          estado: "completada",
        },
      });

      const ventasGuardadas = await tx.venta.createMany({
        data: ventasPreparadas.map((venta) => ({
          ...venta,
          importacionId: importacion.id,
        })),
      });

      return {
        importacionId: importacion.id,
        cantidadImportada: ventasGuardadas.count,
      };
    });


    return NextResponse.json(
    {
        mensaje: "Ventas importadas correctamente",
        importacionId: resultadoImportacion.importacionId,
        cantidadImportada: resultadoImportacion.cantidadImportada,
    },
    { status: 201 }
    );

}

