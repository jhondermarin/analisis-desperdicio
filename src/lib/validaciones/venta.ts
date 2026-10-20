
import { z } from "zod";

export const ventaSchema = z.object({
  fecha: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "La fecha debe tener formato YYYY-MM-DD",
    )
    .refine(
      (valor) => {
        const fecha = new Date(`${valor}T00:00:00.000Z`);

        return (
          !Number.isNaN(fecha.getTime()) &&
          fecha.toISOString().slice(0, 10) === valor
        );
      },
      "La fecha no es válida",
    ),

  productoId: z
    .number()
    .int("El producto debe tener un ID entero")
    .positive("El producto debe tener un ID positivo"),

  cantidad: z
    .string()
    .regex(
      /^\d{1,7}(\.\d{1,3})?$/,
      "La cantidad debe ser positiva y tener como máximo 3 decimales",
    )
    .refine(
      (valor) => Number(valor) > 0,
      "La cantidad debe ser mayor que cero",
    ),

  importacionId: z
    .number()
    .int("La importación debe tener un ID entero")
    .positive("La importación debe tener un ID positivo")
    .nullable()
    .optional(),
});
