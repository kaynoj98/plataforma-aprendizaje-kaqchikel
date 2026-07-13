import * as z from "zod";

export const userIdParamsSchema = z
  .object({
    userId: z.uuid("El identificador del usuario no es válido."),
  })
  .strict();

export const updateMeSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "El nombre debe contener al menos 2 caracteres.")
      .max(100, "El nombre no puede superar 100 caracteres.")
      .optional(),

    lastName: z
      .string()
      .trim()
      .min(2, "El apellido debe contener al menos 2 caracteres.")
      .max(100, "El apellido no puede superar 100 caracteres.")
      .optional(),

    profileType: z.enum(["STUDENT", "TEACHER", "OTHER"]).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar.",
  });

export const listUsersQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),

    pageSize: z.coerce.number().int().min(1).max(100).default(20),

    search: z
      .string()
      .trim()
      .max(100)
      .optional()
      .transform((value) => (value && value.length > 0 ? value : undefined)),

    role: z.enum(["ADMIN", "USER"]).optional(),

    profileType: z.enum(["STUDENT", "TEACHER", "OTHER"]).optional(),

    status: z.enum(["PENDING", "ACTIVE", "BLOCKED", "DISABLED"]).optional(),

    sortBy: z
      .enum([
        "createdAt",
        "email",
        "firstName",
        "lastName",
        "role",
        "profileType",
        "status",
      ])
      .default("createdAt"),

    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  })
  .strict();

export const updateUserStatusSchema = z
  .object({
    status: z.enum(["ACTIVE", "BLOCKED", "DISABLED"]),

    reason: z
      .string()
      .trim()
      .max(500, "El motivo no puede superar 500 caracteres.")
      .optional(),
  })
  .strict();

export type UserIdParams = z.infer<typeof userIdParamsSchema>;

export type UpdateMeInput = z.infer<typeof updateMeSchema>;

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
