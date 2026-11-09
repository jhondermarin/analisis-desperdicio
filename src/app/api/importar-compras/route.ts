
import { NextRequest, NextResponse } from "next/server";
import { compraSchema } from "@/lib/validaciones/compra";

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

        // Comprobar que el CSV contiene registros
    if (lineas.length < 2) {
      return NextResponse.json(
        {
          error: "El archivo CSV debe contener encabezados y al menos una compra.",
        },
        { status: 400 }
      );
    }

    // Validar los encabezados del archivo
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

    const compras = lineas.slice(1).map((linea) => {
    const [fecha, productoId, cantidad] = linea.split(",");

    return {
        fecha,
        productoId: Number(productoId),
        cantidad,
    };
    });

    
    const resultados = compras.map((compra, indice) => {
    const validacion = compraSchema.safeParse(compra);

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
        mensaje: "El CSV contiene errores. No se importó ninguna compra.",
        resultados,
        },
        { status: 400 }
    );
    }

    
    const productos = await prisma.producto.findMany({
      where: {
        id: {
          in: compras.map((compra) => compra.productoId),
        },
      },
    });

    const productosInvalidos = compras.filter((compra) => {
      const producto = productos.find(
        (p) => p.id === compra.productoId
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

    
  const comprasPreparadas = compras.map((compra) => {
    const producto = productos.find(
      (p) => p.id === compra.productoId
    )!;

    const cantidadDecimal = new Prisma.Decimal(compra.cantidad);
    const costeUnitario = producto.costeUnitario;

    const total = cantidadDecimal
      .mul(costeUnitario)
      .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

    return {
      fecha: new Date(`${compra.fecha}T00:00:00.000Z`),
      productoId: compra.productoId,
      proveedorId: null,
      cantidad: cantidadDecimal,
      costeUnitario,
      total,
      importacionId: null,
    };
  });



  const resultadoImportacion = await prisma.$transaction(async (tx) => {
    const importacion = await tx.importacion.create({
      data: {
        tipo: "compras",
        archivo: archivo.name,
        filasOk: comprasPreparadas.length,
        filasError: 0,
        estado: "completada",
      },
    });

    const comprasGuardadas = await tx.compra.createMany({
      data: comprasPreparadas.map((compra) => ({
        ...compra,
        importacionId: importacion.id,
      })),
    });

    return {
      importacionId: importacion.id,
      cantidadImportada: comprasGuardadas.count,
    };
  });


  return NextResponse.json(
    {
      mensaje: "Compras importadas correctamente",
      importacionId: resultadoImportacion.importacionId,
      cantidadImportada: resultadoImportacion.cantidadImportada,
    },
    { status: 201 }
  );

}
