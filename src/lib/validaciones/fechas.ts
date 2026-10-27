
export function esFechaValida(valor: string | null): boolean {
  if (valor === null) {
    return true;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return false;
  }

  const fecha = new Date(`${valor}T00:00:00.000Z`);

  return (
    !Number.isNaN(fecha.getTime()) &&
    fecha.toISOString().slice(0, 10) === valor
  );
}


export function esRangoFechaValido(
  fechaDesde: string | null,
  fechaHasta: string | null,
): boolean {
  if (fechaDesde === null || fechaHasta === null) {
    return true;
  }

  return fechaDesde <= fechaHasta;
}
