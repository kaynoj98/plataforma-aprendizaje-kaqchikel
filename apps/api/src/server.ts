import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

const server = app.listen(env.PORT, () => {
  console.log(`API de Kaqchikel disponible en http://localhost:${env.PORT}`);
});

function shutdown(signal: string): void {
  console.log(`Se recibió ${signal}. Cerrando el servidor...`);

  server.close(async (error) => {
    try {
      await prisma.$disconnect();

      if (error) {
        console.error("No fue posible cerrar el servidor:", error);

        process.exit(1);
      }

      process.exit(0);
    } catch (disconnectError) {
      console.error("No fue posible cerrar Prisma:", disconnectError);

      process.exit(1);
    }
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
