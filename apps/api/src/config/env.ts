import "dotenv/config";
import * as z from "zod";

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    PORT: z.coerce.number().int().positive().default(4000),

    WEB_ORIGIN: z.string().url().default("http://localhost:3000"),

    APP_URL: z.string().url().default("http://localhost:3000"),

    DATABASE_URL: z.string().min(1, {
      message: "DATABASE_URL es obligatoria.",
    }),

    SESSION_DURATION_DAYS: z.coerce.number().int().min(1).max(30).default(7),

    MAIL_MODE: z.enum(["log", "smtp"]).default("log"),

    SMTP_HOST: z.string().trim().optional(),

    SMTP_PORT: z.coerce.number().int().positive().default(587),

    SMTP_SECURE: z
      .enum(["true", "false"])
      .default("false")
      .transform((value) => value === "true"),

    SMTP_USER: z.string().trim().optional(),

    SMTP_PASSWORD: z.string().optional(),

    SMTP_FROM_NAME: z.string().trim().min(1).default("Plataforma Kaqchikel"),

    SMTP_FROM_EMAIL: z.string().trim().email().default("no-reply@example.com"),

    EMAIL_VERIFICATION_TOKEN_HOURS: z.coerce
      .number()
      .int()
      .min(1)
      .max(168)
      .default(24),

    PASSWORD_RESET_TOKEN_MINUTES: z.coerce
      .number()
      .int()
      .min(5)
      .max(1440)
      .default(30),
  })
  .superRefine((data, context) => {
    if (data.MAIL_MODE !== "smtp") {
      return;
    }

    if (!data.SMTP_HOST) {
      context.addIssue({
        code: "custom",
        path: ["SMTP_HOST"],
        message: "SMTP_HOST es obligatorio cuando MAIL_MODE es smtp.",
      });
    }

    if (!data.SMTP_USER) {
      context.addIssue({
        code: "custom",
        path: ["SMTP_USER"],
        message: "SMTP_USER es obligatorio cuando MAIL_MODE es smtp.",
      });
    }

    if (!data.SMTP_PASSWORD) {
      context.addIssue({
        code: "custom",
        path: ["SMTP_PASSWORD"],
        message: "SMTP_PASSWORD es obligatorio cuando MAIL_MODE es smtp.",
      });
    }
  });

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error(
    "Las variables de entorno del backend no son válidas:",
    result.error.flatten().fieldErrors,
  );

  process.exit(1);
}

export const env = result.data;
