import { describe, expect, it } from "vitest";

import {
  loginSchema,
  registerSchema,
} from "../src/modules/auth/auth.schemas.js";

describe("Esquemas de autenticación", () => {
  it("acepta un registro válido", () => {
    const result = registerSchema.safeParse({
      firstName: "Juan",
      lastName: "Pérez",
      email: "JUAN@EXAMPLE.COM",
      password: "ContraseñaSegura123!",
      passwordConfirmation: "ContraseñaSegura123!",
      profileType: "STUDENT",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.email).toBe("juan@example.com");
    }
  });

  it("rechaza contraseñas diferentes", () => {
    const result = registerSchema.safeParse({
      firstName: "Juan",
      lastName: "Pérez",
      email: "juan@example.com",
      password: "ContraseñaSegura123!",
      passwordConfirmation: "OtraContraseña123!",
      profileType: "STUDENT",
    });

    expect(result.success).toBe(false);
  });

  it("rechaza una contraseña débil", () => {
    const result = registerSchema.safeParse({
      firstName: "Juan",
      lastName: "Pérez",
      email: "juan@example.com",
      password: "123456",
      passwordConfirmation: "123456",
      profileType: "STUDENT",
    });

    expect(result.success).toBe(false);
  });

  it("acepta credenciales de login válidas", () => {
    const result = loginSchema.safeParse({
      email: "admin@example.com",
      password: "Password123!",
    });

    expect(result.success).toBe(true);
  });
});
