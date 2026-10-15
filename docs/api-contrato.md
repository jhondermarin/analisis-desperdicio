# Contrato de la API REST

Proyecto: herramienta de análisis de ventas y detección de pérdidas y desperdicio.
Estado: versión 1, definida en la Fase 1 (preparación). Puede ajustarse durante el desarrollo; cualquier cambio se anota en este documento.

## 1. Para qué sirve este documento

El contrato fija qué rutas existen, qué datos reciben y qué datos devuelven. Las pantallas y el servidor se construyen contra este acuerdo, así que se pueden desarrollar por separado sin que luego no encajen. Además, será la base de la conexión directa con el programa de ventas del establecimiento (fase posterior).

## 2. Convenciones generales

- Todas las rutas cuelgan de `/api`.
- Formato JSON en UTF-8.
- Fechas en formato `YYYY-MM-DD`.
- Importes con punto decimal y dos decimales; cantidades hasta tres decimales (kg, litros o unidades).
- Los nombres de los campos van en `camelCase`, aunque en la base de datos estén en `snake_case`.
- Los importes totales (`total`, `costeTotal`) **los calcula siempre el servidor**; el cliente nunca los envía.

### Códigos de respuesta

| Código | Significado |
|---|---|
| 200 | Correcto |
| 201 | Recurso creado |
| 400 | Datos mal formados o parámetros inválidos |
| 404 | El recurso no existe |
| 409 | Conflicto (por ejemplo, nombre duplicado) |
| 422 | Fila inválida durante una importación |
| 500 | Error interno |

### Formato de error

```json
{ "error": "Mensaje corto", "detalle": "Explicación o campo afectado" }
```

### Paginación en listados

Parámetros: `?pagina=1&limite=50`. Respuesta:

```json
{ "datos": [], "total": 0, "pagina": 1, "limite": 50 }
```

## 3. Catálogos

| Método | Ruta | Cuerpo | Descripción |
|---|---|---|---|
| GET | `/categorias` | | Lista las categorías |
| POST | `/categorias` | `{ "nombre": "Bebidas" }` | Crea una categoría |
| GET | `/proveedores` | | Lista los proveedores |
| POST | `/proveedores` | `{ "nombre": "...", "contacto": "..." }` | Crea un proveedor (`contacto` opcional) |
| GET | `/motivos` | | Lista los motivos de desperdicio |
| POST | `/motivos` | `{ "nombre": "Caducidad" }` | Crea un motivo |

## 4. Productos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/productos` | Lista productos. Filtros: `categoria`, `activo`, `buscar` |
| POST | `/productos` | Crea un producto |
| GET | `/productos/:id` | Detalle de un producto |
| PUT | `/productos/:id` | Modifica un producto |
| DELETE | `/productos/:id` | Desactiva el producto (`activo = false`); no se borra para conservar el histórico |

Cuerpo de ejemplo (POST y PUT):

```json
{
  "nombre": "Cerveza de barril",
  "categoriaId": 1,
  "unidad": "l",
  "costeUnitario": 1.80,
  "precioVenta": 4.50
}
```

## 5. Ventas

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/ventas` | Lista ventas. Filtros: `desde`, `hasta`, `producto`, `pagina`, `limite` |
| POST | `/ventas` | Registra una línea de venta |

```json
{ "fecha": "2026-10-15", "productoId": 3, "cantidad": 12.5, "precioUnitario": 4.50 }
```

El servidor calcula `total = cantidad × precioUnitario`.

## 6. Compras

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/compras` | Lista compras. Filtros: `desde`, `hasta`, `producto`, `proveedor`, `pagina`, `limite` |
| POST | `/compras` | Registra una compra |

```json
{ "fecha": "2026-10-14", "productoId": 3, "proveedorId": 1, "cantidad": 50, "costeUnitario": 1.80 }
```

`proveedorId` es opcional. El servidor calcula `total = cantidad × costeUnitario`.

## 7. Desperdicios

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/desperdicios` | Lista desperdicios. Filtros: `desde`, `hasta`, `producto`, `motivo`, `pagina`, `limite` |
| POST | `/desperdicios` | Registra un desperdicio |

```json
{ "fecha": "2026-10-15", "productoId": 3, "motivoId": 1, "cantidad": 2.5, "notas": "Barril caducado" }
```

El servidor calcula `costeTotal = cantidad × coste unitario del producto en ese momento` y lo guarda, para que el histórico no cambie si el coste del producto se modifica más adelante.

## 8. Importaciones (Excel/CSV)

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/importaciones` | Sube un archivo y lo importa |
| GET | `/importaciones` | Historial de importaciones |

Petición `multipart/form-data` con los campos:

- `archivo`: fichero `.csv` o `.xlsx`.
- `tipo`: `ventas` o `compras`.

Respuesta (201):

```json
{
  "id": 7,
  "tipo": "ventas",
  "archivo": "ventas_octubre.csv",
  "filasOk": 118,
  "filasError": 2,
  "estado": "con_errores",
  "errores": [
    { "fila": 14, "campo": "producto", "mensaje": "Producto no encontrado: Cafe solo" },
    { "fila": 52, "campo": "cantidad", "mensaje": "Debe ser un número mayor que 0" }
  ]
}
```

Reglas de importación:

- Cada fila se valida de forma independiente; las filas con error **no se insertan** y se devuelven en `errores`.
- El producto se localiza por nombre exacto, sin distinguir mayúsculas.
- Estados posibles: `completada` (sin errores), `con_errores` (algunas filas fallaron) y `fallida` (no se pudo leer el archivo o ninguna fila es válida).
- Formatos de columnas: ver las plantillas de la carpeta `plantillas-csv`.

## 9. Análisis

Todas las rutas requieren los parámetros `desde` y `hasta`.

| Método | Ruta | Parámetros extra | Devuelve |
|---|---|---|---|
| GET | `/analisis/resumen` | | Totales del periodo |
| GET | `/analisis/ranking-ventas` | `orden=top\|bottom`, `limite=10` | Productos más o menos vendidos |
| GET | `/analisis/desperdicio-producto` | | Desperdicio por producto |
| GET | `/analisis/desperdicio-motivo` | | Desperdicio por motivo |
| GET | `/analisis/compras-exceso` | | Productos comprados en exceso |

Ejemplos de respuesta:

```json
// /analisis/resumen
{ "ventasTotal": 12450.50, "comprasTotal": 8230.00, "costePerdidas": 640.75, "mermaPorcentaje": 7.8 }

// /analisis/ranking-ventas?orden=top
[ { "productoId": 3, "nombre": "Cerveza de barril", "cantidad": 410.5, "total": 1847.25 } ]

// /analisis/desperdicio-producto
[ { "productoId": 8, "nombre": "Lechuga", "cantidad": 14.2, "costeTotal": 28.40, "mermaPorcentaje": 18.5 } ]

// /analisis/desperdicio-motivo
[ { "motivoId": 1, "nombre": "Caducidad", "cantidad": 32.0, "costeTotal": 210.30 } ]

// /analisis/compras-exceso
[ { "productoId": 5, "nombre": "Salmón", "comprado": 40, "vendido": 28, "desperdiciado": 3, "exceso": 9 } ]
```

Fórmulas:

- Merma (%) = desperdicio ÷ compras × 100.
- Coste de las pérdidas = suma de `costeTotal` de los desperdicios.
- Exceso de compra = comprado − vendido − desperdiciado en el periodo.

## 10. Recomendaciones

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/recomendaciones?desde=&hasta=` | Lista de consejos generados por reglas |

```json
[
  {
    "tipo": "merma_alta",
    "productoId": 8,
    "nombre": "Lechuga",
    "mensaje": "La merma es del 18,5 %. Reduce el pedido o ajusta la preparación.",
    "ahorroEstimado": 28.40
  }
]
```

Reglas iniciales (los umbrales son valores de partida y se ajustarán con datos reales):

- `merma_alta`: merma del producto igual o superior al 10 %.
- `compra_excesiva`: exceso superior al 20 % de lo comprado.
- `baja_rotacion`: producto entre los menos vendidos y con exceso de compra; se sugiere no reponerlo.