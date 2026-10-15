import { z } from "zod";

export const productoSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(150),
  categoriaId: z.number().int().positive(),
  unidad: z.enum(["kg", "l", "ud"]),
  costeUnitario: z.number().min(0),
  precioVenta: z.number().min(0),
});