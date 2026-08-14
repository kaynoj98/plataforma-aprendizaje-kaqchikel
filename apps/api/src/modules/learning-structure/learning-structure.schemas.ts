import * as z from "zod";

export const courseIdParamsSchema = z
  .object({
    courseId: z.string().uuid("El identificador del curso no es válido."),
  })
  .strict();

export const levelIdParamsSchema = z
  .object({
    levelId: z.string().uuid("El identificador del nivel no es válido."),
  })
  .strict();

export const unitIdParamsSchema = z
  .object({
    unitId: z.string().uuid("El identificador de la unidad no es válido."),
  })
  .strict();

export const lessonIdParamsSchema = z
  .object({
    lessonId: z.string().uuid("El identificador de la lección no es válido."),
  })
  .strict();

const titleSchema = z
  .string()
  .trim()
  .min(3, "El título debe contener al menos 3 caracteres.")
  .max(200, "El título no puede superar 200 caracteres.");

const descriptionSchema = z
  .string()
  .trim()
  .max(5000, "La descripción no puede superar 5000 caracteres.");

const positionSchema = z.coerce
  .number()
  .int()
  .min(0, "La posición no puede ser negativa.");

export const createLevelSchema = z
  .object({
    title: titleSchema,

    description: descriptionSchema.optional(),

    position: positionSchema.default(0),
  })
  .strict();

export const updateLevelSchema = z
  .object({
    title: titleSchema.optional(),

    description: descriptionSchema.nullable().optional(),

    position: positionSchema.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar.",
  });

export const createUnitSchema = z
  .object({
    title: titleSchema,

    description: descriptionSchema.optional(),

    position: positionSchema.default(0),
  })
  .strict();

export const updateUnitSchema = z
  .object({
    title: titleSchema.optional(),

    description: descriptionSchema.nullable().optional(),

    position: positionSchema.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar.",
  });

export const createLessonSchema = z
  .object({
    title: titleSchema,

    slug: z
      .string()
      .trim()
      .min(3, "El slug debe contener al menos 3 caracteres.")
      .max(220, "El slug no puede superar 220 caracteres.")
      .optional(),

    description: descriptionSchema.optional(),

    estimatedMinutes: z.coerce
      .number()
      .int()
      .min(1, "La duración estimada debe ser mayor a 0.")
      .max(600, "La duración estimada no puede superar 600 minutos.")
      .default(10),

    position: positionSchema.default(0),
  })
  .strict();

export const updateLessonSchema = z
  .object({
    title: titleSchema.optional(),

    slug: z
      .string()
      .trim()
      .min(3, "El slug debe contener al menos 3 caracteres.")
      .max(220, "El slug no puede superar 220 caracteres.")
      .optional(),

    description: descriptionSchema.nullable().optional(),

    estimatedMinutes: z.coerce
      .number()
      .int()
      .min(1, "La duración estimada debe ser mayor a 0.")
      .max(600, "La duración estimada no puede superar 600 minutos.")
      .optional(),

    position: positionSchema.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar.",
  });

export const listChildrenQuerySchema = z
  .object({
    includeArchived: z.coerce.boolean().default(false),
  })
  .strict();

export type CourseIdParams = z.infer<typeof courseIdParamsSchema>;
export type LevelIdParams = z.infer<typeof levelIdParamsSchema>;
export type UnitIdParams = z.infer<typeof unitIdParamsSchema>;
export type LessonIdParams = z.infer<typeof lessonIdParamsSchema>;

export type CreateLevelInput = z.infer<typeof createLevelSchema>;
export type UpdateLevelInput = z.infer<typeof updateLevelSchema>;

export type CreateUnitInput = z.infer<typeof createUnitSchema>;
export type UpdateUnitInput = z.infer<typeof updateUnitSchema>;

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;

export type ListChildrenQuery = z.infer<typeof listChildrenQuerySchema>;
