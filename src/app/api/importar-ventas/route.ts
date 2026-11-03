
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



    const ventasGuardadas = await prisma.venta.createMany({
    data: ventasPreparadas,
    });

    return NextResponse.json(
    {
        mensaje: "Ventas importadas correctamente",
        cantidadImportada: ventasGuardadas.count,
    },
    { status: 201 }
    );

}

