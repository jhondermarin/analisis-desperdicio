import { z } from "zod";

export const categoriaSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(100),
});

export const proveedorSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(150),
  contacto: z.string().trim().max(150, "El contacto no puede tener más de 150 caracteres").optional().transform((val) => (val === "" ? null : val)),
});


export const motivoDesperdicioSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre del motivo es obligatorio")
    .max(100, "El nombre no puede tener más de 100 caracteres"),
});
