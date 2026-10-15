import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productoSchema } from "@/lib/validaciones/producto";
import { serializarProducto } from "@/lib/serializar";
import { errorJson } from "@/lib/http";

type Contexto = { params: Promise<{ id: string }> };

function leerId(valor: string) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(_request: NextRequest, { params }: Contexto) {
  const id = leerId((await params).id);
  if (!id) return errorJson(400, "Id inválido");

  const producto = await prisma.producto.findUnique({
    where: { id },
    include: { categoria: true },
  });
  if (!producto) return errorJson(404, "Producto no encontrado");

  return NextResponse.json(serializarProducto(producto));
}

export async function PUT(request: NextRequest, { params }: Contexto) {
  const id = leerId((await params).id);
  if (!id) return errorJson(400, "Id inválido");

  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return errorJson(400, "JSON inválido", "El cuerpo de la petición no es un JSON válido");
  }

  const resultado = productoSchema.safeParse(cuerpo);
  if (!resultado.success) {
    const detalle = resultado.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    return errorJson(400, "Datos inválidos", detalle);
  }

  const existe = await prisma.producto.findUnique({ where: { id } });
  if (!existe) return errorJson(404, "Producto no encontrado");

  const categoria = await prisma.categoria.findUnique({
    where: { id: resultado.data.categoriaId },
  });
  if (!categoria) {
    return errorJson(400, "Categoría inexistente", `No existe la categoría ${resultado.data.categoriaId}`);
  }

  const producto = await prisma.producto.update({
    where: { id },
    data: resultado.data,
    include: { categoria: true },
  });

  return NextResponse.json(serializarProducto(producto));
}

export async function DELETE(_request: NextRequest, { params }: Contexto) {
  const id = leerId((await params).id);
  if (!id) return errorJson(400, "Id inválido");

  const existe = await prisma.producto.findUnique({ where: { id } });
  if (!existe) return errorJson(404, "Producto no encontrado");

  const producto = await prisma.producto.update({
    where: { id },
    data: { activo: false },
    include: { categoria: true },
  });

  return NextResponse.json(serializarProducto(producto));
}