
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Producto = {
  id: number;
  nombre: string;
  unidad: "kg" | "l" | "ud";
  precioVenta: string | number;
};

export default function VentasPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [fecha, setFecha] = useState("");
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [archivoCSV, setArchivoCSV] = useState<File | null>(null);
  const [importando, setImportando] = useState(false);
  const [mensajeImportacion, setMensajeImportacion] = useState("");
  const [errorImportacion, setErrorImportacion] = useState("");

  useEffect(() => {

    async function cargarProductos() {
      try {
        const respuesta = await fetch("/api/productos?activo=true&limite=100");

        if (!respuesta.ok) {
          throw new Error("No se pudieron cargar los productos");
        }

        const resultado = await respuesta.json();
        setProductos(resultado.datos);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar productos"
        );
      }
    }

    cargarProductos();
  }, []);

  const productoSeleccionado = productos.find(
    (producto) => producto.id === Number(productoId)
  );

  const totalEstimado =
    productoSeleccionado && Number(cantidad) > 0
      ? Number(productoSeleccionado.precioVenta) * Number(cantidad)
      : 0;

  async function guardarVenta(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setMensaje("");
    setError("");
    setGuardando(true);

    try {
      const respuesta = await fetch("/api/ventas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fecha,
          productoId: Number(productoId),
          cantidad,
        }),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.detalle || resultado.error || "No se pudo registrar la venta"
        );
      }

      setMensaje("Venta registrada correctamente.");
      setProductoId("");
      setCantidad("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error inesperado"
      );
    } finally {
      setGuardando(false);
    }
  }

  async function importarVentas(evento: React.FormEvent<HTMLFormElement>) {
  evento.preventDefault();

  if (!archivoCSV) {
    setErrorImportacion("Debes seleccionar un archivo CSV.");
    return;
  }

  setImportando(true);
  setMensajeImportacion("");
  setErrorImportacion("");

  try {
    const formulario = new FormData();
    formulario.append("archivo", archivoCSV);

    const respuesta = await fetch("/api/importar-ventas", {
      method: "POST",
      body: formulario,
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      const detalle = Array.isArray(resultado.resultados)
        ? resultado.resultados
            .filter((fila: { valida: boolean }) => !fila.valida)
            .map(
              (fila: { fila: number; errores: string[] }) =>
                `Fila ${fila.fila}: ${fila.errores.join(", ")}`
            )
            .join("; ")
        : "";

      throw new Error(
        [resultado.mensaje || resultado.error || "No se pudo importar el archivo", detalle]
          .filter(Boolean)
          .join(" ")
      );
    }

    setMensajeImportacion(
      `Importación completada: ${resultado.cantidadImportada} ventas registradas.`
    );
    setArchivoCSV(null);
  } catch (err) {
    setErrorImportacion(
      err instanceof Error ? err.message : "Error inesperado al importar"
    );
  } finally {
    setImportando(false);
  }
}

  return (
    <main className="min-h-screen bg-green-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-green-700 hover:underline">
          ← Volver al inicio
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-green-800">
          Registro de ventas
        </h1>

        <p className="mt-3 text-gray-700">
          Registra las ventas realizadas por el establecimiento.
        </p>

        <form
          onSubmit={guardarVenta}
          className="mt-8 space-y-5 rounded-xl bg-white p-6 shadow-sm"
        >
          <label className="flex flex-col gap-2 text-gray-700">
            Fecha de venta
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
              className="rounded border p-3"
            />
          </label>

          <label className="flex flex-col gap-2 text-gray-700">
            Producto
            <select
              value={productoId}
              onChange={(e) => setProductoId(e.target.value)}
              required
              className="rounded border p-3"
            >
              <option value="">Seleccionar producto</option>
              {productos.map((producto) => (
                <option key={producto.id} value={producto.id}>
                  {producto.nombre} ({producto.unidad})
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-gray-700">
            Cantidad
            <input
              type="number"
              min="0.001"
              step="0.001"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              required
              className="rounded border p-3"
            />
          </label>

          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-gray-700">
              Precio unitario:{" "}
              <strong>
                {productoSeleccionado
                  ? `${Number(productoSeleccionado.precioVenta).toFixed(2)} €`
                  : "Selecciona un producto"}
              </strong>
            </p>

            <p className="mt-2 text-lg font-semibold text-green-800">
              Total estimado: {totalEstimado.toFixed(2)} €
            </p>
          </div>

          <button
            type="submit"
            disabled={guardando || productos.length === 0}
            className="rounded-lg bg-green-700 px-6 py-3 font-medium text-white hover:bg-green-800 disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Registrar venta"}
          </button>
        </form>

        <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-green-800">
          Importar ventas desde CSV
        </h2>

        <p className="mt-2 text-sm text-gray-700">
          Selecciona un archivo CSV con las columnas:
          fecha,productoId,cantidad
        </p>

        <form onSubmit={importarVentas} className="mt-5 space-y-4">
          <label className="flex flex-col gap-2 text-gray-700">
            Archivo CSV
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                setArchivoCSV(e.target.files?.[0] ?? null);
                setMensajeImportacion("");
                setErrorImportacion("");
              }}
              className="rounded border p-3"
            />
          </label>

          <button
            type="submit"
            disabled={importando || !archivoCSV}
            className="rounded-lg bg-green-700 px-6 py-3 font-medium text-white hover:bg-green-800 disabled:opacity-50"
          >
            {importando ? "Importando..." : "Importar ventas"}
          </button>
        </form>

        {mensajeImportacion && (
          <p role="status" className="mt-4 rounded bg-green-100 p-4 text-green-800">
            {mensajeImportacion}
          </p>
        )}

        {errorImportacion && (
          <p role="alert" className="mt-4 rounded bg-red-50 p-4 text-red-700">
            {errorImportacion}
          </p>
        )}
      </section>

        {mensaje && (
          <p role="status" className="mt-4 rounded bg-green-100 p-4 text-green-800">
            {mensaje}
          </p>
        )}

        {error && (
          <p role="alert" className="mt-4 rounded bg-red-50 p-4 text-red-700">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
