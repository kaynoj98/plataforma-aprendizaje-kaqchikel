import { describe, expect, it } from "vitest";

import { generateSecureToken, hashToken } from "../src/utils/token.js";

describe("Tokens de sesión", () => {
  it("genera tokens diferentes", () => {
    const first = generateSecureToken();

    const second = generateSecureToken();

    expect(first).not.toBe(second);
  });

  it("genera el mismo hash para el mismo token", () => {
    const token = generateSecureToken();

    expect(hashToken(token)).toBe(hashToken(token));
  });

  it("no guarda el token como su propio hash", () => {
    const token = generateSecureToken();

    expect(hashToken(token)).not.toBe(token);
  });
});
