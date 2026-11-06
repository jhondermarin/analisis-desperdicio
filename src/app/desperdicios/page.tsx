
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Producto = {
  id: number;
  nombre: string;
  unidad: "kg" | "l" | "ud";
  costeUnitario: string | number;
};

type Motivo = {
  id: number;
  nombre: string;
};

export default function DesperdiciosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [motivos, setMotivos] = useState<Motivo[]>([]);

  const [fecha, setFecha] = useState("");
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [motivoId, setMotivoId] = useState("");
  const [notas, setNotas] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [respuestaProductos, respuestaMotivos] =
          await Promise.all([
            fetch("/api/productos?activo=true&limite=100"),
            fetch("/api/motivos-desperdicio"),
          ]);

        if (!respuestaProductos.ok || !respuestaMotivos.ok) {
          throw new Error("No se pudieron cargar los datos");
        }

        const datosProductos = await respuestaProductos.json();
        const datosMotivos = await respuestaMotivos.json();

        setProductos(datosProductos.datos);
        setMotivos(datosMotivos);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar datos"
        );
      }
    }

    cargarDatos();
  }, []);

  const productoSeleccionado = productos.find(
    (producto) => producto.id === Number(productoId)
  );

  const costeUnitario = productoSeleccionado
    ? Number(productoSeleccionado.costeUnitario)
    : 0;

  const totalEstimado =
    Number(cantidad) > 0 ? costeUnitario * Number(cantidad) : 0;

  async function guardarDesperdicio(
    evento: React.FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();
    setMensaje("");
    setError("");
    setGuardando(true);

    try {
      const respuesta = await fetch("/api/desperdicios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fecha,
          productoId: Number(productoId),
          cantidad,
          motivoId: Number(motivoId),
          notas: notas.trim() || null,
        }),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.detalle ||
            resultado.error ||
            "No se pudo registrar el desperdicio"
        );
      }

      setMensaje("Desperdicio registrado correctamente.");
      setProductoId("");
      setCantidad("");
      setMotivoId("");
      setNotas("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error inesperado"
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <main className="min-h-screen bg-green-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-green-700 hover:underline"
        >
          ← Volver al inicio
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-green-800">
          Registro de desperdicios
        </h1>

        <p className="mt-3 text-gray-700">
          Registra los productos desperdiciados, sus cantidades
          y los motivos de las pérdidas.
        </p>

        <form
          onSubmit={guardarDesperdicio}
          className="mt-8 space-y-5 rounded-xl bg-white p-6 shadow-sm"
        >
          <label className="flex flex-col gap-2 text-gray-700">
            Fecha del desperdicio
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
                <option
                  key={producto.id}
                  value={producto.id}
                >
                  {producto.nombre} ({producto.unidad})
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-gray-700">
            Cantidad desperdiciada
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

          <label className="flex flex-col gap-2 text-gray-700">
            Motivo del desperdicio
            <select
              value={motivoId}
              onChange={(e) => setMotivoId(e.target.value)}
              required
              className="rounded border p-3"
            >
              <option value="">Seleccionar motivo</option>
              {motivos.map((motivo) => (
                <option
                  key={motivo.id}
                  value={motivo.id}
                >
                  {motivo.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-gray-700">
            Notas (opcional)
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              maxLength={2000}
              rows={3}
              className="rounded border p-3"
              placeholder="Observaciones sobre el desperdicio"
            />
          </label>

          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-gray-700">
              Coste unitario:{" "}
              <strong>{costeUnitario.toFixed(2)} €</strong>
            </p>

            <p className="mt-2 text-lg font-semibold text-green-800">
              Coste estimado de la pérdida:{" "}
              {totalEstimado.toFixed(2)} €
            </p>
          </div>

          <button
            type="submit"
            disabled={guardando || productos.length === 0}
            className="rounded-lg bg-green-700 px-6 py-3 font-medium text-white hover:bg-green-800 disabled:opacity-50"
          >
            {guardando
              ? "Guardando..."
              : "Registrar desperdicio"}
          </button>
        </form>

        {mensaje && (
          <p
            role="status"
            className="mt-4 rounded bg-green-100 p-4 text-green-800"
          >
            {mensaje}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mt-4 rounded bg-red-50 p-4 text-red-700"
          >
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
