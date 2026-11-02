import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../errors/app-error.js";
import { Prisma } from "../../generated/prisma/client.js";
import type {
  CreateVocabularyInput, UpdateVocabularyInput, ListVocabularyQuery,
  CatalogKind, CatalogInput, CatalogUpdate,
} from "./vocabulary.schemas.js";

const mediaSelect = {
  id: true, mediaType: true, mimeType: true, status: true, deletedAt: true,
} as const;
const vocabularySelect = {
  id: true, termKaqchikel: true, translationSpanish: true, meaning: true,
  examples: true, exampleKaqchikel: true, exampleSpanish: true, notes: true,
  phoneticGuide: true, ipa: true, isActive: true, createdAt: true, updatedAt: true,
  category: true, variant: true,
  pronunciationMedia: { select: mediaSelect }, imageMedia: { select: mediaSelect },
} satisfies Prisma.VocabularyItemSelect;
type Record = Prisma.VocabularyItemGetPayload<{ select: typeof vocabularySelect }>;

function serialize(item: Record, student = false) {
  const { translationSpanish, meaning, pronunciationMedia, imageMedia, category, variant, ...rest } = item;
  const media = (file: Record["imageMedia"]) => file && file.status === "AVAILABLE" && !file.deletedAt
    ? { id: file.id, mediaType: file.mediaType, mimeType: file.mimeType,
        accessUrl: `/api/v1/media/${file.id}/access` }
    : null;
  return { ...rest, translationEs: translationSpanish, description: meaning,
    category: student && !category?.isActive ? null : category,
    variant: student && !variant?.isActive ? null : variant,
    pronunciationMedia: media(pronunciationMedia), imageMedia: media(imageMedia) };
}

function notFound(code: string, message: string): never {
  throw new AppError(404, code, message);
}
async function databaseOperation<T>(operation: () => Promise<T>): Promise<T> {
  try { return await operation(); }
  catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") throw new AppError(409, "VOCABULARY_CONFLICT", "El identificador ya está en uso.");
      if (error.code === "P2003") throw new AppError(400, "INVALID_REFERENCE", "Una referencia no existe.");
      if (error.code === "P2025") notFound("VOCABULARY_NOT_FOUND", "El recurso no existe.");
    }
    throw error;
  }
}
async function audit(tx: Prisma.TransactionClient, actorUserId: string, action: string,
  entityType: string, entityId: string, oldValues: unknown, newValues: unknown) {
  await tx.auditLog.create({ data: { actorUserId, action, entityType, entityId,
    ...(oldValues === null ? {} : { oldValues: JSON.parse(JSON.stringify(oldValues)) }),
    newValues: JSON.parse(JSON.stringify(newValues)),
  } });
}

async function validateReferences(tx: Prisma.TransactionClient, input: UpdateVocabularyInput) {
  if (input.categoryId && !await tx.vocabularyCategory.findFirst({ where: { id: input.categoryId, isActive: true } }))
    throw new AppError(400, "CATEGORY_NOT_FOUND", "La categoría no existe o está inactiva.");
  if (input.variantId && !await tx.vocabularyVariant.findFirst({ where: { id: input.variantId, isActive: true } }))
    throw new AppError(400, "VARIANT_NOT_FOUND", "La variante no existe o está inactiva.");
  for (const [id, mediaType] of [[input.pronunciationMediaId, "AUDIO"], [input.imageMediaId, "IMAGE"]] as const) {
    if (id && !await tx.mediaFile.findFirst({ where: { id, mediaType, status: "AVAILABLE", deletedAt: null } }))
      throw new AppError(400, "INVALID_MEDIA", `El archivo ${mediaType} no existe o no está disponible.`);
  }
}
function itemData(input: UpdateVocabularyInput) {
  const { translationEs, description, ...rest } = input;
  return { ...rest, ...(translationEs === undefined ? {} : { translationSpanish: translationEs }),
    ...(description === undefined ? {} : { meaning: description }) };
}

export async function createVocabulary(actor: string, input: CreateVocabularyInput) {
  return databaseOperation(() => prisma.$transaction(async (tx) => {
    await validateReferences(tx, input);
    const item = await tx.vocabularyItem.create({
      data: { ...itemData(input), termKaqchikel: input.termKaqchikel, translationSpanish: input.translationEs },
      select: vocabularySelect,
    });
    await audit(tx, actor, "VOCABULARY_CREATED", "VocabularyItem", item.id, null, item);
    return serialize(item);
  }));
}
export async function updateVocabulary(actor: string, id: string, input: UpdateVocabularyInput) {
  return databaseOperation(() => prisma.$transaction(async (tx) => {
    const current = await tx.vocabularyItem.findUnique({ where: { id }, select: vocabularySelect });
    if (!current) notFound("VOCABULARY_NOT_FOUND", "El término no existe.");
    await validateReferences(tx, input);
    const item = await tx.vocabularyItem.update({ where: { id }, data: itemData(input), select: vocabularySelect });
    await audit(tx, actor, "VOCABULARY_UPDATED", "VocabularyItem", id, current, item);
    return serialize(item);
  }));
}
export async function getVocabulary(id: string, student: boolean) {
  const item = await prisma.vocabularyItem.findFirst({
    where: { id, ...(student ? { isActive: true } : {}) }, select: vocabularySelect,
  });
  if (!item) notFound("VOCABULARY_NOT_FOUND", "El término no existe.");
  return serialize(item, student);
}
export async function listVocabulary(query: ListVocabularyQuery, student: boolean) {
  const { q, page, pageSize, categoryId, variantId } = query;
  const where: Prisma.VocabularyItemWhereInput = {
    ...(student ? { isActive: true } : query.isActive === undefined ? {} : { isActive: query.isActive }),
    ...(categoryId ? { categoryId } : {}), ...(variantId ? { variantId } : {}),
    ...(q ? { OR: [{ termKaqchikel: { contains: q, mode: "insensitive" } },
      { translationSpanish: { contains: q, mode: "insensitive" } }] } : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.vocabularyItem.findMany({ where, select: vocabularySelect,
      orderBy: [{ termKaqchikel: "asc" }, { id: "asc" }], skip: (page - 1) * pageSize, take: pageSize }),
    prisma.vocabularyItem.count({ where }),
  ]);
  return { items: items.map((item) => serialize(item, student)),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
}

export async function listCatalog(kind: CatalogKind, query: ListVocabularyQuery, student: boolean) {
  const where = { ...(student ? { isActive: true } : query.isActive === undefined ? {} : { isActive: query.isActive }),
    ...(query.q ? { name: { contains: query.q, mode: "insensitive" as const } } : {}) };
  const options = { where, orderBy: [{ name: "asc" as const }, { id: "asc" as const }],
    skip: (query.page - 1) * query.pageSize, take: query.pageSize };
  return prisma.$transaction(async (tx) => {
    const items = kind === "categories" ? await tx.vocabularyCategory.findMany(options) : await tx.vocabularyVariant.findMany(options);
    const total = kind === "categories" ? await tx.vocabularyCategory.count({ where }) : await tx.vocabularyVariant.count({ where });
    return { items, pagination: { page: query.page, pageSize: query.pageSize, total, totalPages: Math.ceil(total / query.pageSize) } };
  });
}
export async function saveCatalog(actor: string, kind: CatalogKind, id: string | undefined, input: CatalogInput | CatalogUpdate) {
  return databaseOperation(() => prisma.$transaction(async (tx) => {
    const category = kind === "categories";
    const current = id ? category ? await tx.vocabularyCategory.findUnique({ where: { id } })
      : await tx.vocabularyVariant.findUnique({ where: { id } }) : null;
    if (id && !current) notFound("CATALOG_NOT_FOUND", "La categoría o variante no existe.");
    const item = category
      ? id ? await tx.vocabularyCategory.update({ where: { id }, data: input as Prisma.VocabularyCategoryUpdateInput })
        : await tx.vocabularyCategory.create({ data: input as Prisma.VocabularyCategoryCreateInput })
      : id ? await tx.vocabularyVariant.update({ where: { id }, data: input as Prisma.VocabularyVariantUpdateInput })
        : await tx.vocabularyVariant.create({ data: input as Prisma.VocabularyVariantCreateInput });
    await audit(tx, actor, id ? "VOCABULARY_CATALOG_UPDATED" : "VOCABULARY_CATALOG_CREATED",
      category ? "VocabularyCategory" : "VocabularyVariant", item.id, current, item);
    return item;
  }));
}

// A student must be able to access the complete published learning hierarchy.
const publishedLesson = {
  deletedAt: null, status: "PUBLISHED",
  unit: { deletedAt: null, status: "PUBLISHED",
    level: { deletedAt: null, status: "PUBLISHED", course: { deletedAt: null, status: "PUBLISHED" } } },
} satisfies Prisma.LessonWhereInput;
async function requireLesson(tx: Prisma.TransactionClient, lessonId: string, student: boolean) {
  if (!await tx.lesson.findFirst({
    where: { id: lessonId, ...(student ? publishedLesson : { deletedAt: null }) }, select: { id: true },
  })) notFound("LESSON_NOT_FOUND", "La lección no existe o no está disponible.");
}
export async function listLessonVocabulary(lessonId: string, student: boolean) {
  return prisma.$transaction(async (tx) => {
    await requireLesson(tx, lessonId, student);
    const links = await tx.lessonVocabulary.findMany({
      where: { lessonId, ...(student ? { isVisible: true, vocabulary: { isActive: true } } : {}) },
      orderBy: [{ position: "asc" }, { id: "asc" }],
      select: { position: true, isVisible: true, vocabulary: { select: vocabularySelect } },
    });
    return links.map((link) => ({ position: link.position, isVisible: link.isVisible, vocabulary: serialize(link.vocabulary, student) }));
  });
}
export async function saveLessonVocabulary(actor: string, lessonId: string, vocabularyId: string,
  input: { position: number; isVisible: boolean } | null) {
  return databaseOperation(() => prisma.$transaction(async (tx) => {
    await requireLesson(tx, lessonId, false);
    if (!await tx.vocabularyItem.findUnique({ where: { id: vocabularyId }, select: { id: true } }))
      notFound("VOCABULARY_NOT_FOUND", "El término no existe.");
    const where = { lessonId_vocabularyId: { lessonId, vocabularyId } };
    const current = await tx.lessonVocabulary.findUnique({ where });
    if (!input && !current) notFound("LESSON_VOCABULARY_NOT_FOUND", "El término no está asociado a la lección.");
    const link = input ? await tx.lessonVocabulary.upsert({ where,
      create: { lessonId, vocabularyId, ...input }, update: input })
      : await tx.lessonVocabulary.update({ where, data: { isVisible: false } });
    await audit(tx, actor, "LESSON_VOCABULARY_UPDATED", "LessonVocabulary", link.id, current, link);
    return link;
  }));
}
