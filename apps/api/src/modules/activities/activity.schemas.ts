import { z } from "zod";

const option = z
  .object({ label: z.string().trim().min(1).max(500), correct: z.boolean() })
  .strict();
const question = z
  .object({
    prompt: z.string().trim().min(1).max(2000),
    feedback: z.string().trim().max(2000).default(""),
    audioMediaId: z.uuid().nullish(),
    audioTranscript: z.string().trim().min(1).max(3000).nullish(),
    imageMediaId: z.uuid().nullish(),
    imageDescription: z.string().trim().min(1).max(500).nullish(),
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

const pair = z
  .object({
    term: z.string().trim().min(1).max(200),
    translation: z.string().trim().min(1).max(255),
    feedback: z.string().trim().max(2000).default(""),
    vocabularyId: z.uuid().nullable().default(null),
  })
  .strict();
export const matchChoice = z
  .object({
    termKey: z.string().regex(/^[a-f0-9]{64}$/),
    translationKey: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict();
export const matchSubmission = matchChoice.extend({ requestId: z.uuid() });
export const definition = z
  .object({
    type: z
      .enum([
        "MULTIPLE_CHOICE",
        "IMAGE_RECOGNITION",
        "AUDIO_RECOGNITION",
        "MATCHING",
      ])
      .default("MULTIPLE_CHOICE"),
    title: z.string().trim().min(1).max(200),
    instructions: z.string().trim().max(3000),
    questions: z.array(question).max(50).default([]),
    pairs: z.array(pair).max(8).default([]),
  })
  .strict()
  .superRefine(({ type, questions, pairs }, ctx) => {
    if (type === "MATCHING") {
      if (questions.length || pairs.length < 3)
        ctx.addIssue({
          code: "custom",
          path: ["pairs"],
          message: "Agrega entre 3 y 8 parejas.",
        });
      for (const field of ["term", "translation"] as const) {
        const labels = pairs.map((p) =>
          p[field]
            .normalize("NFC")
            .toLowerCase()
            .replace(/[’‘ʼ]/gu, "'")
            .replace(/\s+/gu, " "),
        );
        if (new Set(labels).size !== labels.length)
          ctx.addIssue({
            code: "custom",
            path: ["pairs"],
            message: "Cada término y cada traducción deben ser únicos.",
          });
      }
    } else if (!questions.length || pairs.length)
      ctx.addIssue({
        code: "custom",
        path: ["questions"],
        message: "Selecciona preguntas para esta modalidad.",
      });
    for (const [i, q] of questions.entries()) {
      const audio = type === "AUDIO_RECOGNITION";
      if (
        audio
          ? !q.audioMediaId || !q.audioTranscript
          : q.audioMediaId || q.audioTranscript
      )
        ctx.addIssue({
          code: "custom",
          path: ["questions", i],
          message:
            "Cada pregunta auditiva requiere una grabación y su transcripción.",
        });
      const visual = type === "IMAGE_RECOGNITION";
      if (
        visual
          ? !q.imageMediaId || !q.imageDescription
          : q.imageMediaId || q.imageDescription
      )
        ctx.addIssue({
          code: "custom",
          path: ["questions", i],
          message:
            "Cada pregunta visual requiere una imagen y una pista descriptiva.",
        });
      if (
        visual &&
        reveals(q.imageDescription, q.options.find((o) => o.correct)?.label)
      )
        ctx.addIssue({
          code: "custom",
          path: ["questions", i, "imageDescription"],
          message:
            "Describe las características de la imagen sin nombrar la respuesta.",
        });
    }
  });
export function reveals(description?: string | null, label?: string | null) {
  if (!description || !label) return false;
  const words = (s: string) =>
    s
      .normalize("NFC")
      .toLowerCase()
      .replace(/[‘’']/gu, "'")
      .match(/[\p{L}\p{M}\p{N}']+/gu)
      ?.join(" ") ?? "";
  const term = words(label);
  return !!term && (" " + words(description) + " ").includes(" " + term + " ");
}
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
