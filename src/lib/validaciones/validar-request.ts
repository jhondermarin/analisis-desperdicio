
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { errorJson } from "@/lib/http";

type ResultadoValidacion<T> =
  | { ok: true; data: T }
  | { ok: false; response: NextResponse };

export async function leerYValidarJson<T extends z.ZodType>(
  request: NextRequest,
  schema: T,
): Promise<ResultadoValidacion<z.output<T>>> {
  let cuerpo: unknown;

  try {
    cuerpo = await request.json();
  } catch {
    return {
      ok: false,
      response: errorJson(
        400,
        "JSON inválido",
        "El cuerpo de la petición no es un JSON válido",
      ),
    };
  }

  const resultado = schema.safeParse(cuerpo);

  if (!resultado.success) {
    const detalle = resultado.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");

    return {
      ok: false,
      response: errorJson(400, "Datos inválidos", detalle),
    };
  }

  return {
    ok: true,
    data: resultado.data,
  };
}
