import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { productoSchema } from "@/lib/validaciones/producto";
import { serializarProducto } from "@/lib/serializar";
import { errorJson } from "@/lib/http";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const pagina = Math.max(1, Number(searchParams.get("pagina")) || 1);
  const limite = Math.min(100, Math.max(1, Number(searchParams.get("limite")) || 50));
  const categoria = Number(searchParams.get("categoria")) || undefined;
  const activo = searchParams.get("activo");
  const buscar = searchParams.get("buscar")?.trim();

  const where: Prisma.ProductoWhereInput = {};
  if (categoria) where.categoriaId = categoria;
  if (activo === "true") where.activo = true;
  if (activo === "false") where.activo = false;
  if (buscar) where.nombre = { contains: buscar, mode: "insensitive" };

  const [total, productos] = await Promise.all([
    prisma.producto.count({ where }),
    prisma.producto.findMany({
      where,
      include: { categoria: true },
      orderBy: { nombre: "asc" },
      skip: (pagina - 1) * limite,
      take: limite,
    }),
  ]);

  return NextResponse.json({
    datos: productos.map(serializarProducto),
    total,
    pagina,
    limite,
  });
}

export async function POST(request: NextRequest) {
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

  const categoria = await prisma.categoria.findUnique({
    where: { id: resultado.data.categoriaId },
  });
  if (!categoria) {
    return errorJson(400, "Categoría inexistente", `No existe la categoría ${resultado.data.categoriaId}`);
  }

  const producto = await prisma.producto.create({
    data: resultado.data,
    include: { categoria: true },
  });

  return NextResponse.json(serializarProducto(producto), { status: 201 });
}