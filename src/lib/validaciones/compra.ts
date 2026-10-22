
import { z } from "zod";
import { ventaSchema } from "./venta";

export const compraSchema = ventaSchema
  .omit({ importacionId: true })
  .extend({
    proveedorId: z
      .number()
      .int("El proveedor debe tener un ID entero")
      .positive("El proveedor debe tener un ID positivo")
      .nullable()
      .optional(),

    importacionId: z
      .number()
      .int("La importación debe tener un ID entero")
      .positive("La importación debe tener un ID positivo")
      .nullable()
      .optional(),
  });
