import * as z from "zod";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("El correo electrónico no es válido.")
  .max(255, "El correo no puede superar 255 caracteres.");

const passwordSchema = z
  .string()
  .min(12, "La contraseña debe contener al menos 12 caracteres.")
  .max(128, "La contraseña no puede superar 128 caracteres.")
  .regex(/[a-z]/, "La contraseña debe incluir una letra minúscula.")
  .regex(/[A-Z]/, "La contraseña debe incluir una letra mayúscula.")
  .regex(/[0-9]/, "La contraseña debe incluir un número.")
  .regex(/[^A-Za-z0-9]/, "La contraseña debe incluir un símbolo.");

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "El nombre debe contener al menos 2 caracteres.")
      .max(100, "El nombre no puede superar 100 caracteres."),

    lastName: z
      .string()
      .trim()
      .min(2, "El apellido debe contener al menos 2 caracteres.")
      .max(100, "El apellido no puede superar 100 caracteres."),

    email: emailSchema,

    password: passwordSchema,

    passwordConfirmation: z.string(),

    profileType: z.enum(["STUDENT", "TEACHER", "OTHER"]),
  })
  .strict()
  .superRefine((data, context) => {
    if (data.password !== data.passwordConfirmation) {
      context.addIssue({
        code: "custom",
        path: ["passwordConfirmation"],
        message: "Las contraseñas no coinciden.",
      });
    }
  });

export const loginSchema = z
  .object({
    email: emailSchema,

    password: z.string().min(1, "La contraseña es obligatoria.").max(128),
  })
  .strict();

export const verifyEmailSchema = z
  .object({
    token: z
      .string()
      .trim()
      .min(64, "El token de confirmación no es válido.")
      .max(256, "El token de confirmación no es válido."),
  })
  .strict();

export const emailRequestSchema = z
  .object({
    email: emailSchema,
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    token: z
      .string()
      .trim()
      .min(64, "El token de recuperación no es válido.")
      .max(256, "El token de recuperación no es válido."),

    password: passwordSchema,

    passwordConfirmation: z.string(),
  })
  .strict()
  .superRefine((data, context) => {
    if (data.password !== data.passwordConfirmation) {
      context.addIssue({
        code: "custom",
        path: ["passwordConfirmation"],
        message: "Las contraseñas no coinciden.",
      });
    }
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type EmailRequestInput = z.infer<typeof emailRequestSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
