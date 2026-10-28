
import { Prisma } from "@prisma/client";

type DesperdicioParaAgrupar = {
  fecha: Date;
  costeTotal: Prisma.Decimal;
};

export function agruparDesperdiciosPorDia(
  desperdicios: DesperdicioParaAgrupar[],
) {
  const totalesPorDia = new Map<string, Prisma.Decimal>();

  for (const desperdicio of desperdicios) {
    const fecha = desperdicio.fecha.toISOString().slice(0, 10);

    const totalAnterior =
      totalesPorDia.get(fecha) ?? new Prisma.Decimal(0);

    totalesPorDia.set(
      fecha,
      totalAnterior.plus(desperdicio.costeTotal),
    );
  }

  return Array.from(totalesPorDia, ([fecha, costeTotal]) => ({
    fecha,
    costeTotal: costeTotal.toString(),
  })).sort((a, b) => a.fecha.localeCompare(b.fecha));
}