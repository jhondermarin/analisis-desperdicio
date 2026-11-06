
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Categoria = {
  id: number;
  nombre: string;
};

type Producto = {
  id: number;
  nombre: string;
  categoriaId: number;
  unidad: "kg" | "l" | "ud";
  costeUnitario: string;
  precioVenta: string;
};

export default function ProductosPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [nombre, setNombre] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [unidad, setUnidad] = useState<"kg" | "l" | "ud">("ud");
  const [costeUnitario, setCosteUnitario] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function cargarProductos() {
    const respuesta = await fetch("/api/productos?limite=100");
    if (!respuesta.ok) throw new Error("No se pudieron cargar los productos");

    const resultado = await respuesta.json();
    setProductos(resultado.datos);
  }

  useEffect(() => {
    async function cargarDatos() {
      try {
        const respuesta = await fetch("/api/categorias");
        if (!respuesta.ok) throw new Error("No se pudieron cargar las categorías");

        const datos = await respuesta.json();
        setCategorias(datos);
        await cargarProductos();
      } catch (error) {
        setMensaje(error instanceof Error ? error.message : "Error al cargar datos");
      }
    }

    cargarDatos();
  }, []);

  async function guardarProducto(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setMensaje("");
    setGuardando(true);

    try {
      const respuesta = await fetch("/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          categoriaId: Number(categoriaId),
          unidad,
          costeUnitario: Number(costeUnitario),
          precioVenta: Number(precioVenta),
        }),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(resultado.detalle || resultado.error || "Error al guardar");
      }

      setNombre("");
      setCategoriaId("");
      setUnidad("ud");
      setCosteUnitario("");
      setPrecioVenta("");
      setMensaje("Producto registrado correctamente.");
      await cargarProductos();
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <main className="min-h-screen bg-green-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-green-700 hover:underline">
          ← Volver al inicio
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-green-800">
          Gestión de productos
        </h1>

        <form
          onSubmit={guardarProducto}
          className="mt-8 grid gap-4 rounded-xl bg-white p-6 shadow-sm md:grid-cols-2"
        >
          <h2 className="text-xl font-semibold text-green-800 md:col-span-2">
            Registrar producto
          </h2>

          <label className="flex flex-col gap-2 text-gray-700">
            Nombre
            <input
              className="rounded border p-2"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={150}
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-gray-700">
            Categoría
            <select
              className="rounded border p-2"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              required
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-gray-700">
            Unidad
            <select
              className="rounded border p-2"
              value={unidad}
              onChange={(e) => setUnidad(e.target.value as "kg" | "l" | "ud")}
            >
              <option value="ud">Unidades</option>
              <option value="kg">Kilogramos</option>
              <option value="l">Litros</option>
            </select>
          </label>

          <label className="flex flex-col gap-2 text-gray-700">
            Coste unitario (€)
            <input
              type="number"
              min="0"
              step="0.01"
              className="rounded border p-2"
              value={costeUnitario}
              onChange={(e) => setCosteUnitario(e.target.value)}
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-gray-700">
            Precio de venta (€)
            <input
              type="number"
              min="0"
              step="0.01"
              className="rounded border p-2"
              value={precioVenta}
              onChange={(e) => setPrecioVenta(e.target.value)}
              required
            />
          </label>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={guardando}
              className="rounded-lg bg-green-700 px-6 py-3 font-medium text-white hover:bg-green-800 disabled:opacity-50"
            >
              {guardando ? "Guardando..." : "Guardar producto"}
            </button>
          </div>
        </form>

        {mensaje && (
          <p role="status" className="mt-4 rounded bg-white p-3 text-gray-800">
            {mensaje}
          </p>
        )}

        <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-green-800">
            Productos registrados
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead>
                <tr className="border-b">
                  <th className="p-2">Nombre</th>
                  <th className="p-2">Categoría</th>
                  <th className="p-2">Unidad</th>
                  <th className="p-2">Coste</th>
                  <th className="p-2">Precio</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto) => (
                  <tr key={producto.id} className="border-b">
                    <td className="p-2">{producto.nombre}</td>
                    <td className="p-2">
                      {categorias.find((c) => c.id === producto.categoriaId)?.nombre || "—"}
                    </td>
                    <td className="p-2">{producto.unidad}</td>
                    <td className="p-2">{Number(producto.costeUnitario).toFixed(2)} €</td>
                    <td className="p-2">{Number(producto.precioVenta).toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {productos.length === 0 && (
              <p className="mt-4 text-gray-500">No hay productos registrados.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
