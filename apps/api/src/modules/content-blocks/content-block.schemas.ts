import * as z from "zod";

export const lessonIdParamsSchema = z
  .object({
    lessonId: z.string().uuid("El identificador de la lección no es válido."),
  })
  .strict();

export const blockIdParamsSchema = z
  .object({
    blockId: z.string().uuid("El identificador del bloque no es válido."),
  })
  .strict();

const contentSchema = z.record(z.string(), z.unknown());

export const createContentBlockSchema = z
  .object({
    type: z.enum([
      "TEXT",
      "HEADING",
      "IMAGE",
      "AUDIO",
      "VIDEO",
      "DIALOGUE",
      "EXAMPLE",
      "NOTE",
      "VOCABULARY",
      "DOCUMENT",
      "QUIZ",
    ]),

    title: z
      .string()
      .trim()
      .max(200, "El título no puede superar 200 caracteres.")
      .optional(),

    content: contentSchema,

    position: z.coerce
      .number()
      .int()
      .min(0, "La posición no puede ser negativa.")
      .default(0),

    isVisible: z.boolean().default(true),
  })
  .strict();

export const updateContentBlockSchema = z
  .object({
    type: z
      .enum([
        "TEXT",
        "HEADING",
        "IMAGE",
        "AUDIO",
        "VIDEO",
        "DIALOGUE",
        "EXAMPLE",
        "NOTE",
        "VOCABULARY",
        "DOCUMENT",
        "QUIZ",
      ])
      .optional(),

    title: z.string().trim().max(200).nullable().optional(),

    content: contentSchema.optional(),

    position: z.coerce.number().int().min(0).optional(),

    isVisible: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar.",
  });

const reorderItemSchema = z.object({
  blockId: z.string().uuid(),

  position: z.number().int().min(0),
});

export const reorderContentBlocksSchema = z
  .object({
    blocks: z
      .array(reorderItemSchema)
      .min(1, "Debes enviar al menos un bloque."),
  })
  .strict()
  .superRefine((data, context) => {
    const ids = data.blocks.map((item) => item.blockId);

    const positions = data.blocks.map((item) => item.position);

    if (new Set(ids).size !== ids.length) {
      context.addIssue({
        code: "custom",
        path: ["blocks"],
        message: "No pueden existir bloques duplicados.",
      });
    }

    if (new Set(positions).size !== positions.length) {
      context.addIssue({
        code: "custom",
        path: ["blocks"],
        message: "No pueden existir posiciones duplicadas.",
      });
    }
  });

export type LessonIdParams = z.infer<typeof lessonIdParamsSchema>;

export type BlockIdParams = z.infer<typeof blockIdParamsSchema>;

export type CreateContentBlockInput = z.infer<typeof createContentBlockSchema>;

export type UpdateContentBlockInput = z.infer<typeof updateContentBlockSchema>;

export type ReorderContentBlocksInput = z.infer<
  typeof reorderContentBlocksSchema
>;
