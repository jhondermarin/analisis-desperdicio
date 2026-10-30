
const indicadores = [
  {
    titulo: "Ventas totales",
    valor: "1.250,00 €",
  },
  {
    titulo: "Compras totales",
    valor: "780,00 €",
  },
  {
    titulo: "Desperdicios",
    valor: "95,00 €",
  },
  {
    titulo: "Porcentaje de desperdicio",
    valor: "12,2 %",
  },
];

export default function DashboardPage() {
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


      <p>Vista de demostración con datos simulados.</p>

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
    </main>
  );
}
