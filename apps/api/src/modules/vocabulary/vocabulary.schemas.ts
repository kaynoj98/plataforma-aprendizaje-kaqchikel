import * as z from "zod";

const uuid = z.string().uuid();
const text = z.string().trim();
const partial = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) =>
  schema.partial().extend({ isActive: z.boolean().optional() }).refine((value) => Object.values(value).some((v) => v !== undefined), "Envía al menos un campo.");

export const createVocabularySchema = z.object({
  termKaqchikel: text.min(1).max(200),
  translationEs: text.min(1).max(255),
  description: text.max(3000).nullable().optional(),
  examples: z.array(z.object({
    termKaqchikel: text.min(1).max(500),
    translationEs: text.min(1).max(500),
  }).strict()).max(10).optional(),
  exampleKaqchikel: text.max(3000).nullable().optional(),
  exampleSpanish: text.max(3000).nullable().optional(),
  notes: text.max(3000).nullable().optional(),
  phoneticGuide: text.max(500).nullable().optional(),
  ipa: text.max(500).nullable().optional(),
  categoryId: uuid.nullable().optional(),
  variantId: uuid.nullable().optional(),
  pronunciationMediaId: uuid.nullable().optional(),
  imageMediaId: uuid.nullable().optional(),
  isActive: z.boolean().default(false),
}).strict();
export const updateVocabularySchema = partial(createVocabularySchema);
export const listVocabularyQuerySchema = z.object({
  q: text.max(100).optional(),
  page: z.coerce.number().int().min(1).max(1000000).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  categoryId: uuid.optional(),
  variantId: uuid.optional(),
  isActive: z.enum(["true", "false"]).transform((v) => v === "true").optional(),
});
export const categorySchema = z.object({
  name: text.min(1).max(150),
  slug: text.min(1).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: text.max(3000).nullable().optional(),
  isActive: z.boolean().default(true),
}).strict();
export const updateCategorySchema = partial(categorySchema);
export const variantSchema = z.object({
  name: text.min(1).max(150),
  code: text.min(1).max(50).regex(/^[a-zA-Z0-9_-]+$/),
  region: text.max(150).nullable().optional(),
  description: text.max(3000).nullable().optional(),
  isActive: z.boolean().default(true),
}).strict();
export const updateVariantSchema = partial(variantSchema);
export const vocabularyParamsSchema = z.object({ vocabularyId: uuid });
export const catalogParamsSchema = z.object({ id: uuid });
export const lessonParamsSchema = z.object({ lessonId: uuid });
export const lessonVocabularyParamsSchema = z.object({ lessonId: uuid, vocabularyId: uuid });
export const lessonVocabularySchema = z.object({
  position: z.number().int().min(0).max(2147483647),
  isVisible: z.boolean().default(true),
}).strict();
export type CreateVocabularyInput = z.infer<typeof createVocabularySchema>;
export type UpdateVocabularyInput = z.infer<typeof updateVocabularySchema>;
export type ListVocabularyQuery = z.infer<typeof listVocabularyQuerySchema>;
export type CatalogKind = "categories" | "variants";
export type CatalogInput = z.infer<typeof categorySchema> | z.infer<typeof variantSchema>;
export type CatalogUpdate = z.infer<typeof updateCategorySchema> | z.infer<typeof updateVariantSchema>;
