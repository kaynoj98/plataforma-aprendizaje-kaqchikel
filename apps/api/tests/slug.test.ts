import { describe, expect, it } from "vitest";

import { createSlug } from "../src/utils/slug.js";

describe("createSlug", () => {
  it("genera un slug básico", () => {
    expect(createSlug("Kaqchikel Inicial")).toBe("kaqchikel-inicial");
  });

  it("elimina tildes y símbolos", () => {
    expect(createSlug("Curso: Saludos y Presentación")).toBe(
      "curso-saludos-y-presentacion",
    );
  });

  it("limpia espacios repetidos", () => {
    expect(createSlug("  Aprender   Kaqchikel  ")).toBe("aprender-kaqchikel");
  });
});
