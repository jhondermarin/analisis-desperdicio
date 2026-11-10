
# Análisis de Ventas y Desperdicio

Aplicación web para registrar, consultar y analizar las compras, ventas y desperdicios de productos de un establecimiento.

El objetivo del proyecto es facilitar el seguimiento de las operaciones y proporcionar información visual que ayude a identificar pérdidas y oportunidades de mejora.

## Aplicación publicada

La aplicación está desplegada en Vercel y utiliza una base de datos PostgreSQL alojada en Neon.

URL: [(https://analisis-desperdicio.vercel.app)]

## Funcionalidades

- Gestión de productos, categorías y proveedores.
- Registro de compras y ventas.
- Registro de desperdicios y sus motivos.
- Importación de compras y ventas mediante archivos CSV.
- Dashboard con indicadores económicos y gráficos.
- Análisis de desperdicios por producto y motivo.
- Visualización de la evolución de los desperdicios.
- Filtrado de indicadores por fechas.
- Recomendaciones basadas en los datos registrados.
- Validación de datos en las rutas API.

## Tecnologías utilizadas

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Prisma ORM 6
- PostgreSQL
- Zod
- Recharts

## Ejecución local

### Requisitos

- Node.js y npm
- PostgreSQL
- Una base de datos configurada

### Instalación

```bash
npm install
```

Crear un archivo `.env` con la variable `DATABASE_URL` correspondiente a la base de datos local.

Aplicar las migraciones:

```bash
npx prisma migrate deploy
```

Generar el cliente Prisma:

```bash
npx prisma generate
```

Iniciar el servidor de desarrollo:

```bash
npm run dev
```

Abrir http://localhost:3000 en el navegador.

## Datos de demostración

El repositorio incluye scripts para preparar datos de ejemplo:

- `prisma/seed.ts`: categorías y motivos de desperdicio.
- `prisma/seed-demo.ts`: productos de demostración.
- `prisma/seed-operaciones-demo.ts`: compras, ventas y desperdicios ficticios.

Estos scripts no se ejecutan automáticamente durante la compilación.

La aplicación publicada contiene datos ficticios para facilitar su evaluación.

## Despliegue

- Código fuente: GitHub.
- Aplicación web: Vercel.
- Base de datos: Neon PostgreSQL.

La variable `DATABASE_URL` se configura mediante las variables de entorno del servicio de despliegue y no se almacena en el repositorio.

## Nota

Proyecto desarrollado como parte de un período de prácticas formativas.
