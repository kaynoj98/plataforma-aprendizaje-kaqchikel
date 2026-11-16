import { z } from "zod";

const option = z
  .object({ label: z.string().trim().min(1).max(500), correct: z.boolean() })
  .strict();
const question = z
  .object({
    prompt: z.string().trim().min(1).max(2000),
    feedback: z.string().trim().max(2000).default(""),
    vocabularyId: z.uuid().nullable().default(null),
    options: z.array(option).min(2).max(10),
  })
  .strict()
  .superRefine(({ options }, ctx) => {
    if (options.filter((o) => o.correct).length !== 1)
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: "Selecciona una respuesta correcta por pregunta.",
      });
    if (new Set(options.map((o) => o.label)).size !== options.length)
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: "Las opciones de una pregunta deben ser distintas.",
      });
  });

export const definition = z
  .object({
    title: z.string().trim().min(1).max(200),
    instructions: z.string().trim().max(3000),
    questions: z.array(question).min(1).max(50),
  })
  .strict();
export const placement = z.number().int().min(0).max(2147483647);
export const createActivity = z
  .object({ requestId: z.uuid(), definition, position: placement })
  .strict();
export const editActivity = z
  .object({
    revision: z.number().int().positive(),
    definition: definition.optional(),
    position: placement,
    isVisible: z.boolean(),
  })
  .strict();
export const choice = z
  .object({ questionId: z.uuid(), optionId: z.uuid() })
  .strict();
export const start = z.object({ requestId: z.uuid() }).strict();
export type Definition = z.infer<typeof definition>;
export function totals(total: number, correct: number) {
  return {
    total,
    correct,
    incorrect: total - correct,
    percentage: Math.round((correct * 100) / total),
  };
}
