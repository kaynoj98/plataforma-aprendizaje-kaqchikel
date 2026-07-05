import "dotenv/config";
import * as z from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(4000),

  WEB_ORIGIN: z.string().url().default("http://localhost:3000"),

  DATABASE_URL: z.string().min(1, {
    message: "DATABASE_URL es obligatoria.",
  }),

  SESSION_DURATION_DAYS: z.coerce.number().int().min(1).max(30).default(7),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error(
    "Las variables de entorno del backend no son válidas: ",
    result.error.flatten().fieldErrors,
  );
  process.exit(1);
}

export const env = result.data;
