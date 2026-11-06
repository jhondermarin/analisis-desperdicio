
import Link from "next/link";

const modulos = [
  {
    titulo: "Productos",
    descripcion:
      "Consulta los productos registrados y añade nuevos productos.",
    ruta: "/productos",
    boton: "Gestionar productos",
  },
  {
    titulo: "Ventas",
    descripcion:
      "Registra las ventas realizadas por el establecimiento.",
    ruta: "/ventas",
    boton: "Registrar ventas",
  },
  {
    titulo: "Compras",
    descripcion:
      "Registra las compras de productos y sus proveedores.",
    ruta: "/compras",
    boton: "Registrar compras",
  },
  {
    titulo: "Desperdicios",
    descripcion:
      "Registra las pérdidas, cantidades y motivos de desperdicio.",
    ruta: "/desperdicios",
    boton: "Registrar desperdicios",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-green-50 px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-green-800">
          Análisis de ventas y desperdicio
        </h1>

        <p className="mt-4 text-lg text-gray-700">
          Herramienta para analizar ventas, compras y pérdidas,
          detectar desperdicios y mejorar la rentabilidad
          de bares, restaurantes y tiendas.
        </p>

        <section className="mt-10 rounded-xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-green-800">
            Panel de control
          </h2>

          <p className="mt-3 text-gray-600">
            Consulta las estadísticas, gráficos y recomendaciones
            obtenidas a partir de los datos registrados.
          </p>

          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-lg bg-green-700 px-6 py-3 font-medium text-white hover:bg-green-800"
          >
            Acceder al dashboard
          </Link>
        </section>

        <h2 className="mt-10 text-2xl font-semibold text-green-800">
          Gestión de datos
        </h2>

        <section className="mt-5 grid gap-6 md:grid-cols-2">
          {modulos.map((modulo) => (
            <div
              key={modulo.ruta}
              className="flex flex-col rounded-xl bg-white p-6 shadow-sm"
            >
              <h3 className="text-xl font-semibold text-green-800">
                {modulo.titulo}
              </h3>

              <p className="mt-3 flex-1 text-gray-600">
                {modulo.descripcion}
              </p>

              <Link
                href={modulo.ruta}
                className="mt-6 inline-block self-start rounded-lg bg-green-700 px-5 py-3 font-medium text-white hover:bg-green-800"
              >
                {modulo.boton}
              </Link>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

