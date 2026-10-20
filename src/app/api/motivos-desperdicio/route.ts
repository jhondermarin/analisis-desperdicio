
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { motivoDesperdicioSchema } from "@/lib/validaciones/catalogo";
import { leerYValidarJson } from "@/lib/validaciones/validar-request";
import { errorJson } from "@/lib/http";

export async function GET() {
  const motivos = await prisma.motivoDesperdicio.findMany({
    orderBy: { nombre: "asc" },
  });

  return NextResponse.json(motivos);
}

export async function POST(request: NextRequest) {
  const resultado = await leerYValidarJson(
    request,
    motivoDesperdicioSchema,
  );

  if (!resultado.ok) {
    return resultado.response;
  }

  try {
    const motivo = await prisma.motivoDesperdicio.create({
      data: resultado.data,
    });

    return NextResponse.json(motivo, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return errorJson(
        409,
        "Motivo duplicado",
        "Ya existe un motivo de desperdicio con ese nombre",
      );
    }

    throw error;
  }
}

