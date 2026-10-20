import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { categoriaSchema } from "@/lib/validaciones/catalogo";
import { errorJson } from "@/lib/http";

export async function GET() {
  const categorias = await prisma.categoria.findMany({
    orderBy: { nombre: "asc" },
  });
  return NextResponse.json(categorias);
}

export async function POST(request: NextRequest) {
  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return errorJson(400, "JSON inválido", "El cuerpo de la petición no es un JSON válido");
  }

  const resultado = categoriaSchema.safeParse(cuerpo);
  if (!resultado.success) {
    const detalle = resultado.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    return errorJson(400, "Datos inválidos", detalle);
  }

  try {
    const categoria = await prisma.categoria.create({ data: resultado.data });
    return NextResponse.json(categoria, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return errorJson(409, "Categoría duplicada", `Ya existe una categoría llamada "${resultado.data.nombre}"`);
    }
    throw error;
  }
}