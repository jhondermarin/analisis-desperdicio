
import { describe, expect, it } from "vitest";
import { esFechaValida, esRangoFechaValido } from "./fechas";

describe("esFechaValida", () => {
  it("acepta una fecha válida", () => {
    expect(esFechaValida("2026-10-30")).toBe(true);
  });

  it("rechaza una fecha inexistente", () => {
    expect(esFechaValida("2026-02-30")).toBe(false);
 });

  it("rechaza una fecha con formato incorrecto", () => {
    expect(esFechaValida("30/10/2026")).toBe(false);
 });

  it("acepta el 29 de febrero en un año bisiesto", () => {
    expect(esFechaValida("2024-02-29")).toBe(true);
 });

  it("rechaza el 29 de febrero en un año no bisiesto", () => {
  expect(esFechaValida("2025-02-29")).toBe(false);
});


});

describe("esRangoFechaValido", () => {
  it("rechaza un rango de fechas invertido", () => {
    expect(
      esRangoFechaValido("2026-10-30", "2026-10-20")
    ).toBe(false);
  });

  it("acepta un rango de fechas válido", () => {
    expect(
        esRangoFechaValido("2026-10-01", "2026-10-30")
    ).toBe(true);
 });

  it("acepta un rango con fechas iguales", () => {
    expect(
        esRangoFechaValido("2026-10-30", "2026-10-30")
    ).toBe(true);
 });

  it("acepta un rango sin fecha final", () => {
    expect(
        esRangoFechaValido("2026-10-01", null)
    ).toBe(true);
});

  it("acepta un rango sin fecha inicial", () => {
  expect(
    esRangoFechaValido(null, "2026-10-30")
  ).toBe(true);
});

  it("acepta un rango sin ninguna fecha", () => {
  expect(
    esRangoFechaValido(null, null)
  ).toBe(true);
});



});