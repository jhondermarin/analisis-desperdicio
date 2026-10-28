
import { describe, expect, it } from "vitest";
import { Prisma } from "@prisma/client";
import { agruparDesperdiciosPorDia } from "./agrupar-desperdicios";

describe("agruparDesperdiciosPorDia", () => {
  it("agrupa los costes por día y ordena las fechas", () => {
    const desperdicios = [
      {
        fecha: new Date("2026-10-24T00:00:00.000Z"),
        costeTotal: new Prisma.Decimal("2.00"),
      },
      {
        fecha: new Date("2026-10-23T00:00:00.000Z"),
        costeTotal: new Prisma.Decimal("4.75"),
      },
      {
        fecha: new Date("2026-10-23T00:00:00.000Z"),
        costeTotal: new Prisma.Decimal("1.90"),
      },
    ];

    const resultado = agruparDesperdiciosPorDia(desperdicios);

    expect(resultado).toEqual([
      {
        fecha: "2026-10-23",
        costeTotal: "6.65",
      },
      {
        fecha: "2026-10-24",
        costeTotal: "2",
      },
    ]);
  });

  it("devuelve una lista vacía cuando no hay desperdicios", () => {
    const resultado = agruparDesperdiciosPorDia([]);

    expect(resultado).toEqual([]);
});
    it("suma importes decimales sin errores de precisión", () => {
    const desperdicios = [
        {
        fecha: new Date("2026-10-25T00:00:00.000Z"),
        costeTotal: new Prisma.Decimal("0.10"),
        },
        {
        fecha: new Date("2026-10-25T00:00:00.000Z"),
        costeTotal: new Prisma.Decimal("0.20"),
        },
    ];

    const resultado = agruparDesperdiciosPorDia(desperdicios);

    expect(resultado).toEqual([
        {
        fecha: "2026-10-25",
        costeTotal: "0.3",
        },
    ]);
    });

});