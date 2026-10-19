import * as z from "zod";

export const mediaIdParamsSchema = z
  .object({
    mediaId: z.string().uuid("El identificador multimedia no es válido."),
  })
  .strict();

export const listMediaQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),

    pageSize: z.coerce.number().int().min(1).max(100).default(20),

    type: z.enum(["IMAGE", "AUDIO", "VIDEO", "DOCUMENT"]).optional(),

    status: z.enum(["PROCESSING", "AVAILABLE", "FAILED", "DELETED"]).optional(),

    search: z
      .string()
      .trim()
      .max(100)
      .optional()
      .transform((value) => (value && value.length > 0 ? value : undefined)),

    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  })
  .strict();

export type MediaIdParams = z.infer<typeof mediaIdParamsSchema>;

export type ListMediaQuery = z.infer<typeof listMediaQuerySchema>;
