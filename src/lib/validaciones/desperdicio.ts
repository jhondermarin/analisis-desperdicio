
import { z } from "zod";
import { ventaSchema } from "./venta";

export const desperdicioSchema = ventaSchema
  .omit({ importacionId: true })
  .extend({
    motivoId: z
      .number()
      .int("El motivo debe tener un ID entero")
      .positive("El motivo debe tener un ID positivo"),

    notas: z
      .string()
      .trim()
      .max(2000, "Las notas no pueden superar los 2000 caracteres")
      .nullable()
      .optional(),
  });
