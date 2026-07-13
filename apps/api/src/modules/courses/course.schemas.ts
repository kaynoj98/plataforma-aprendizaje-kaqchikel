import * as z from "zod";

export const courseIdParamsSchema = z
  .object({
    courseId: z.string().uuid("El identificador del curso no es válido."),
  })
  .strict();

export const courseSlugParamsSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .min(1, "El slug es obligatorio.")
      .max(220, "El slug no puede superar 220 caracteres."),
  })
  .strict();

export const createCourseSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "El título debe contener al menos 3 caracteres.")
      .max(200, "El título no puede superar 200 caracteres."),

    slug: z
      .string()
      .trim()
      .min(3, "El slug debe contener al menos 3 caracteres.")
      .max(220, "El slug no puede superar 220 caracteres.")
      .optional(),

    description: z
      .string()
      .trim()
      .min(10, "La descripción debe contener al menos 10 caracteres.")
      .max(5000, "La descripción no puede superar 5000 caracteres."),

    objectives: z
      .string()
      .trim()
      .max(5000, "Los objetivos no pueden superar 5000 caracteres.")
      .optional(),

    difficulty: z
      .enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"])
      .default("BEGINNER"),

    position: z.coerce
      .number()
      .int()
      .min(0, "La posición no puede ser negativa.")
      .default(0),

    isPublicPreview: z.coerce.boolean().default(false),
  })
  .strict();

export const updateCourseSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "El título debe contener al menos 3 caracteres.")
      .max(200, "El título no puede superar 200 caracteres.")
      .optional(),

    slug: z
      .string()
      .trim()
      .min(3, "El slug debe contener al menos 3 caracteres.")
      .max(220, "El slug no puede superar 220 caracteres.")
      .optional(),

    description: z
      .string()
      .trim()
      .min(10, "La descripción debe contener al menos 10 caracteres.")
      .max(5000, "La descripción no puede superar 5000 caracteres.")
      .optional(),

    objectives: z
      .string()
      .trim()
      .max(5000, "Los objetivos no pueden superar 5000 caracteres.")
      .nullable()
      .optional(),

    difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),

    position: z.coerce
      .number()
      .int()
      .min(0, "La posición no puede ser negativa.")
      .optional(),

    isPublicPreview: z.coerce.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar.",
  });

export const adminListCoursesQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),

    pageSize: z.coerce.number().int().min(1).max(100).default(20),

    search: z
      .string()
      .trim()
      .max(100)
      .optional()
      .transform((value) => (value && value.length > 0 ? value : undefined)),

    difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),

    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),

    sortBy: z
      .enum([
        "createdAt",
        "updatedAt",
        "publishedAt",
        "title",
        "position",
        "status",
        "difficulty",
      ])
      .default("createdAt"),

    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  })
  .strict();

export const publicListCoursesQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),

    pageSize: z.coerce.number().int().min(1).max(100).default(20),

    search: z
      .string()
      .trim()
      .max(100)
      .optional()
      .transform((value) => (value && value.length > 0 ? value : undefined)),

    difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),

    sortBy: z
      .enum(["publishedAt", "title", "position", "difficulty"])
      .default("position"),

    sortOrder: z.enum(["asc", "desc"]).default("asc"),
  })
  .strict();

export type CourseIdParams = z.infer<typeof courseIdParamsSchema>;

export type CourseSlugParams = z.infer<typeof courseSlugParamsSchema>;

export type CreateCourseInput = z.infer<typeof createCourseSchema>;

export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

export type AdminListCoursesQuery = z.infer<typeof adminListCoursesQuerySchema>;

export type PublicListCoursesQuery = z.infer<
  typeof publicListCoursesQuerySchema
>;
