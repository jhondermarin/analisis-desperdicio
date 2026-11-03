"use client";

import { useEffect, useState } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


export default function DashboardPage() {

  const [resumen, setResumen] = useState<{
    totalVentas: string;
    totalCompras: string;
    totalDesperdicios: string;
    porcentajeDesperdicio: string | null;
  } | null>(null);

  
  const [productosDesperdiciados, setProductosDesperdiciados] =
    useState<
      {
        productoId: number;
        producto: string | null;
        cantidadRegistros: number;
        cantidadDesperdiciada: string;
        costeTotal: string;
      }[]
    >([]);

  
  const [productosVendidos, setProductosVendidos] = useState<
    {
      productoId: number;
      producto: string;
      cantidadVendida: string;
      totalVendido: string;
    }[]
  >([]);

  
  const [productosComprados, setProductosComprados] = useState<
    {
      productoId: number;
      producto: string;
      cantidadComprada: string;
      totalComprado: string;
    }[]
  >([]);


  
  const [recomendaciones, setRecomendaciones] = useState<
    {
      productoId: number;
      producto: string;
      cantidadComprada: number;
      cantidadVendida: number;
      cantidadDesperdiciada: number;
      porcentajeDesperdicio: number;
      recomendacion: string;
    }[]
  >([]);

  
  const [productos, setProductos] = useState<
    {
      id: number;
      nombre: string;
      unidad: string;
    }[]
  >([]);

  
  const [unidadSeleccionada, setUnidadSeleccionada] = useState("l");

  
  useEffect(() => {
    fetch("/api/dashboard/resumen")
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error("Error al consultar el resumen");
        }

        return respuesta.json();
      })
      .then((datos) => {
        setResumen(datos);
      })
      .catch((error) => {
        console.error("Error al cargar el dashboard:", error);
      });
  }, []);

  
  useEffect(() => {
    fetch("/api/dashboard/desperdicios-por-producto")
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error("Error al consultar los desperdicios");
        }

        return respuesta.json();
      })
      .then((datos) => {
        setProductosDesperdiciados(datos);
      })
      .catch((error) => {
        console.error("Error al cargar los productos:", error);
      });
  }, []);

    
  useEffect(() => {
    fetch("/api/dashboard/ventas-por-producto")
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error("Error al consultar las ventas por producto");
        }

        return respuesta.json();
      })
      .then((datos) => {
        setProductosVendidos(datos);
      })
      .catch((error) => {
        console.error("Error al cargar las ventas:", error);
      });
  }, []);

  
  useEffect(() => {
    fetch("/api/dashboard/recomendaciones")
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error("Error al consultar las recomendaciones");
        }

        return respuesta.json();
      })
      .then((datos) => {
        setRecomendaciones(datos);
      })
      .catch((error) => {
        console.error("Error al cargar las recomendaciones:", error);
      });
  }, []);

  
  useEffect(() => {
    fetch("/api/dashboard/compras-por-producto")
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error("Error al consultar las compras por producto");
        }

        return respuesta.json();
      })
      .then((datos) => {
        setProductosComprados(datos);
      })
      .catch((error) => {
        console.error("Error al cargar las compras:", error);
      });
  }, []);

  
  useEffect(() => {
    fetch("/api/productos")
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error("Error al consultar los productos");
        }

        return respuesta.json();
      })
      .then((resultado) => {
        setProductos(resultado.datos);
      })
      .catch((error) => {
        console.error("Error al cargar los productos:", error);
      });
  }, []);

  
  
  const datosComparativos = productosComprados.map((compra) => {
    
    const producto = productos.find(
      (p) => p.id === compra.productoId
    );

    const venta = productosVendidos.find(
      (v) => v.productoId === compra.productoId
    );

    const desperdicio = productosDesperdiciados.find(
      (d) => d.productoId === compra.productoId
    );

    return {
      producto: compra.producto,
      unidad: producto?.unidad ?? "Sin unidad",
      compras: Number(compra.cantidadComprada),
      ventas: Number(venta?.cantidadVendida ?? 0),
      desperdicios: Number(
        desperdicio?.cantidadDesperdiciada ?? 0
      ),
    };
  });


  const indicadores = [
    {
      titulo: "Ventas totales",
      valor: resumen
        ? `${Number(resumen.totalVentas).toFixed(2)} €`
        : "Cargando...",
    },
    {
      titulo: "Compras totales",
      valor: resumen
        ? `${Number(resumen.totalCompras).toFixed(2)} €`
        : "Cargando...",
    },
    {
      titulo: "Desperdicios",
      valor: resumen
        ? `${Number(resumen.totalDesperdicios).toFixed(2)} €`
        : "Cargando...",
    },
    {
      titulo: "Porcentaje de desperdicio",
      valor: resumen
        ? resumen.porcentajeDesperdicio !== null
          ? `${resumen.porcentajeDesperdicio} %`
          : "No disponible"
        : "Cargando...",
    },
  ];


  return (
    
    <main
    style={{
        minHeight: "100vh",
        padding: "40px 32px",
        backgroundColor: "#e8f3ec",
        color: "#1f2937",
    }}
    >
        
    <h1
    style={{
        fontSize: "32px",
        fontWeight: "700",
        color: "#166534",
        marginBottom: "12px",
    }}
    >
    Dashboard de ventas y desperdicios
    </h1>


      <p>Resumen Economico del negocio.</p>

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginTop: "32px",
        }}
      >
        {indicadores.map((indicador) => (
          <article
            key={indicador.titulo}
            style={{
              padding: "24px",
              border: "1px solid #d1e7d8",
              borderLeft: "5px solid #16a34a",
              borderRadius: "12px",
              backgroundColor: "#ffffff",
              color: "#222222",
            }}
          >
            <h2 style={{ fontSize: "16px" }}>
              {indicador.titulo}
            </h2>


            <p
            style={{
                fontSize: "30px",
                fontWeight: "700",
                marginTop: "12px",
                color: "#166534",
                letterSpacing: "-0.5px",
            }}
            >
            {indicador.valor}
            </p>

          </article>
        ))}
      </section>
      
    <h2
      style={{
        marginTop: "40px",
        marginBottom: "16px",
        color: "#166534",
      }}
    >
      Desperdicios por producto
    </h2>

    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        backgroundColor: "white",
      }}
    >
      <thead>
        <tr>
          <th style={{ padding: "12px", textAlign: "left" }}>
            Producto
          </th>
          <th style={{ padding: "12px", textAlign: "left" }}>
            Cantidad desperdiciada
          </th>
          <th style={{ padding: "12px", textAlign: "left" }}>
            Coste de pérdida
          </th>
        </tr>
      </thead>

      <tbody>
        {productosDesperdiciados.map((producto) => (
          <tr key={producto.productoId}>
            <td style={{ padding: "12px", borderTop: "1px solid #ddd" }}>
              {producto.producto ?? "Sin nombre"}
            </td>
            <td style={{ padding: "12px", borderTop: "1px solid #ddd" }}>
              {producto.cantidadDesperdiciada}
            </td>
            <td style={{ padding: "12px", borderTop: "1px solid #ddd" }}>
              {Number(producto.costeTotal).toFixed(2)} €
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    
    <h3
      style={{
        marginTop: "30px",
        marginBottom: "16px",
        color: "#166534",
      }}
    >
      Gráfica de desperdicios por producto
    </h3>

    <div style={{ width: "100%", height: "300px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={productosDesperdiciados.map((producto) => ({
            nombre: producto.producto ?? "Sin nombre",
            cantidad: Number(producto.cantidadDesperdiciada),
          }))}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nombre" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="cantidad" fill="#dc2626" />
        </BarChart>
      </ResponsiveContainer>
    </div>

    
    <h3
      style={{
        marginTop: "30px",
        marginBottom: "16px",
        color: "#166534",
      }}
    >
      Gráfica de compras por producto
    </h3>

    <div style={{ width: "100%", height: "300px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={productosComprados.map((producto) => ({
            nombre: producto.producto,
            cantidad: Number(producto.cantidadComprada),
          }))}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nombre" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="cantidad" fill="#2563eb" />
        </BarChart>
      </ResponsiveContainer>
    </div>

    
    <h3
      style={{
        marginTop: "30px",
        marginBottom: "16px",
        color: "#166534",
      }}
    >
      Comparativa de compras, ventas y desperdicios
    </h3>
    
    
    <label
      htmlFor="unidad"
      style={{
        display: "block",
        marginBottom: "16px",
      }}
    >
      Unidad de medida:{" "}
      <select
        id="unidad"
        value={unidadSeleccionada}
        onChange={(e) => setUnidadSeleccionada(e.target.value)}
        style={{
          padding: "8px",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      >
        {[...new Set(datosComparativos.map((p) => p.unidad))].map(
          (unidad) => (
            <option key={unidad} value={unidad}>
              {unidad}
            </option>
          )
        )}
      </select>
    </label>



    <div style={{ width: "100%", height: "350px" }}>
      <ResponsiveContainer width="100%" height="100%">        
          <BarChart
            data={datosComparativos.filter(
              (producto) => producto.unidad === unidadSeleccionada
            )}
          >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="producto" />
          <YAxis />
          <Tooltip />

          <Bar
            dataKey="compras"
            name="Compras"
            fill="#2563eb"
          />

          <Bar
            dataKey="ventas"
            name="Ventas"
            fill="#16a34a"
          />

          <Bar
            dataKey="desperdicios"
            name="Desperdicios"
            fill="#dc2626"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>




    <h2
      style={{
        marginTop: "40px",
        marginBottom: "16px",
        color: "#166534",
      }}
    >
      Productos más y menos vendidos
    </h2>

    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        backgroundColor: "white",
      }}
    >
      <thead>
        <tr>
          <th style={{ padding: "12px", textAlign: "left" }}>
            Producto
          </th>
          <th style={{ padding: "12px", textAlign: "left" }}>
            Cantidad vendida
          </th>
          <th style={{ padding: "12px", textAlign: "left" }}>
            Total vendido
          </th>
        </tr>
      </thead>

      <tbody>
        {productosVendidos.map((producto) => (
          <tr key={producto.productoId}>
            <td style={{ padding: "12px", borderTop: "1px solid #ddd" }}>
              {producto.producto}
            </td>
            <td style={{ padding: "12px", borderTop: "1px solid #ddd" }}>
              {producto.cantidadVendida}
            </td>
            <td style={{ padding: "12px", borderTop: "1px solid #ddd" }}>
              {Number(producto.totalVendido).toFixed(2)} €
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    
    <h3
      style={{
        marginTop: "30px",
        marginBottom: "16px",
        color: "#166534",
      }}
    >
      Gráfica de ventas por producto
    </h3>

    <div style={{ width: "100%", height: "300px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={productosVendidos.map((producto) => ({
            nombre: producto.producto,
            cantidad: Number(producto.cantidadVendida),
          }))}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nombre" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="cantidad" fill="#16a34a" />
        </BarChart>
      </ResponsiveContainer>
    </div>


    
    <h2
      style={{
        marginTop: "40px",
        marginBottom: "16px",
        color: "#166534",
      }}
    >
      Recomendaciones automáticas
    </h2>

    <section>
      {recomendaciones.map((item) => (
        <div
          key={item.productoId}
          style={{
            backgroundColor: "white",
            padding: "20px",
            marginBottom: "12px",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        >
          <p>
            <strong>Producto:</strong> {item.producto}
          </p>

          <p>
            <strong>Comprado:</strong> {item.cantidadComprada}
          </p>

          <p>
            <strong>Vendido:</strong> {item.cantidadVendida}
          </p>

          <p>
            <strong>Desperdiciado:</strong> {item.cantidadDesperdiciada}
          </p>

          <p>
            <strong>Porcentaje de desperdicio:</strong>{" "}
            {item.porcentajeDesperdicio} %
          </p>

          <p>
            <strong>Recomendación:</strong> {item.recomendacion}
          </p>
        </div>
      ))}
    </section>



    </main>
  );
}
