import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../src/app.js";

describe("Rutas inexistentes", () => {
  it("debe responder 404 con el formato definido", async () => {
    const response = await request(app).get("/api/v1/no-existe").expect(404);

    expect(response.body).toEqual({
      success: false,
      error: {
        code: "ROUTE_NOT_FOUND",
        message: "La ruta GET /api/v1/no-existe no existe.",
      },
    });
  });
});
