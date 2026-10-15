import type { Producto, Categoria } from "@prisma/client";

export function serializarProducto(p: Producto & { categoria?: Categoria }) {
  return {
    id: p.id,
    nombre: p.nombre,
    categoriaId: p.categoriaId,
    categoria: p.categoria?.nombre,
    unidad: p.unidad,
    costeUnitario: Number(p.costeUnitario),
    precioVenta: Number(p.precioVenta),
    activo: p.activo,
  };
}