import { Router } from "express";

import { prisma } from "../lib/prisma.js";

export const healthRouter = Router();

healthRouter.get("/", async (_request, response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    response.status(200).json({
      success: true,
      data: {
        status: "ok",
        service: "kaqchikel-api",
        database: "ok",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("La comprobación de PostgreSQL falló:", error);

    response.status(503).json({
      success: false,
      error: {
        code: "DATABASE_UNAVAILABLE",
        message:
          "La API está activa, pero la base de datos no está disponible.",
      },
    });
  }
});
