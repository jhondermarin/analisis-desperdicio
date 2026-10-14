-- CreateTable
CREATE TABLE "categorias" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proveedores" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "contacto" VARCHAR(150),

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "categoria_id" INTEGER NOT NULL,
    "unidad" VARCHAR(10) NOT NULL,
    "coste_unitario" DECIMAL(10,2) NOT NULL,
    "precio_venta" DECIMAL(10,2) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "motivos_desperdicio" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,

    CONSTRAINT "motivos_desperdicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "importaciones" (
    "id" SERIAL NOT NULL,
    "tipo" VARCHAR(10) NOT NULL,
    "archivo" VARCHAR(255) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "filas_ok" INTEGER NOT NULL DEFAULT 0,
    "filas_error" INTEGER NOT NULL DEFAULT 0,
    "estado" VARCHAR(20) NOT NULL,

    CONSTRAINT "importaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ventas" (
    "id" SERIAL NOT NULL,
    "fecha" DATE NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "cantidad" DECIMAL(10,3) NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "importacion_id" INTEGER,

    CONSTRAINT "ventas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compras" (
    "id" SERIAL NOT NULL,
    "fecha" DATE NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "proveedor_id" INTEGER,
    "cantidad" DECIMAL(10,3) NOT NULL,
    "coste_unitario" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "importacion_id" INTEGER,

    CONSTRAINT "compras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "desperdicios" (
    "id" SERIAL NOT NULL,
    "fecha" DATE NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "motivo_id" INTEGER NOT NULL,
    "cantidad" DECIMAL(10,3) NOT NULL,
    "coste_total" DECIMAL(12,2) NOT NULL,
    "notas" TEXT,

    CONSTRAINT "desperdicios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nombre_key" ON "categorias"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "motivos_desperdicio_nombre_key" ON "motivos_desperdicio"("nombre");

-- CreateIndex
CREATE INDEX "ventas_fecha_idx" ON "ventas"("fecha");

-- CreateIndex
CREATE INDEX "ventas_producto_id_idx" ON "ventas"("producto_id");

-- CreateIndex
CREATE INDEX "compras_fecha_idx" ON "compras"("fecha");

-- CreateIndex
CREATE INDEX "compras_producto_id_idx" ON "compras"("producto_id");

-- CreateIndex
CREATE INDEX "desperdicios_fecha_idx" ON "desperdicios"("fecha");

-- CreateIndex
CREATE INDEX "desperdicios_producto_id_idx" ON "desperdicios"("producto_id");

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_importacion_id_fkey" FOREIGN KEY ("importacion_id") REFERENCES "importaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras" ADD CONSTRAINT "compras_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras" ADD CONSTRAINT "compras_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras" ADD CONSTRAINT "compras_importacion_id_fkey" FOREIGN KEY ("importacion_id") REFERENCES "importaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "desperdicios" ADD CONSTRAINT "desperdicios_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "desperdicios" ADD CONSTRAINT "desperdicios_motivo_id_fkey" FOREIGN KEY ("motivo_id") REFERENCES "motivos_desperdicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
