
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { proveedorSchema } from "@/lib/validaciones/catalogo";
import { leerYValidarJson } from "@/lib/validaciones/validar-request";

export async function GET() {
  const proveedores = await prisma.proveedor.findMany({
    orderBy: { nombre: "asc" },
  });

  return NextResponse.json(proveedores);
}

export async function POST(request: NextRequest) {
  const resultado = await leerYValidarJson(
    request,
    proveedorSchema,
  );

  if (!resultado.ok) {
    return resultado.response;
  }

  const proveedor = await prisma.proveedor.create({
    data: resultado.data,
  });

  return NextResponse.json(proveedor, { status: 201 });
}
