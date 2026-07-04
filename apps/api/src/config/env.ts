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
});
