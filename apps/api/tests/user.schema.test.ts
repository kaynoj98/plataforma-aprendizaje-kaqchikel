import { describe, expect, it } from "vitest";

import {
  listUsersQuerySchema,
  updateMeSchema,
  updateUserStatusSchema,
  userIdParamsSchema,
} from "../src/modules/users/user.schemas.js";

describe("Esquemas de usuarios", () => {
  it("acepta actualización válida del perfil propio", () => {
    const result = updateMeSchema.safeParse({
      firstName: "María",
      lastName: "López",
      profileType: "TEACHER",
    });

    expect(result.success).toBe(true);
  });

  it("rechaza actualización vacía del perfil propio", () => {
    const result = updateMeSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it("aplica valores por defecto en listado de usuarios", () => {
    const result = listUsersQuerySchema.safeParse({});

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(20);
      expect(result.data.sortBy).toBe("createdAt");
      expect(result.data.sortOrder).toBe("desc");
    }
  });

  it("rechaza pageSize mayor a 100", () => {
    const result = listUsersQuerySchema.safeParse({
      pageSize: "101",
    });

    expect(result.success).toBe(false);
  });

  it("acepta UUID válido", () => {
    const result = userIdParamsSchema.safeParse({
      userId: "7de05f79-21eb-4a2c-bd75-899a63fbb843",
    });

    expect(result.success).toBe(true);
  });

  it("rechaza UUID inválido", () => {
    const result = userIdParamsSchema.safeParse({
      userId: "abc",
    });

    expect(result.success).toBe(false);
  });

  it("acepta cambio de estado válido", () => {
    const result = updateUserStatusSchema.safeParse({
      status: "BLOCKED",
      reason: "Prueba de bloqueo.",
    });

    expect(result.success).toBe(true);
  });
});
