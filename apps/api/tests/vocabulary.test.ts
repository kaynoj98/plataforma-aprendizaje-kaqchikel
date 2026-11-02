import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";


import { Prisma } from "../src/generated/prisma/client.js";

const mocks = vi.hoisted(() => {
  const delegate = () => Object.fromEntries(["findFirst", "findUnique", "findMany", "count", "create", "update", "upsert"].map((key) => [key, vi.fn()]));
  return { db: { vocabularyItem: delegate(), vocabularyCategory: delegate(), vocabularyVariant: delegate(),
    lesson: delegate(), lessonVocabulary: delegate(), mediaFile: delegate(), auditLog: delegate(), $transaction: vi.fn() },
    validateSession: vi.fn() };
});
vi.mock("../src/lib/prisma.js", () => ({ prisma: mocks.db }));
vi.mock("../src/services/storage.service.js", () => ({
  storageService: { createAccessUrl: vi.fn().mockResolvedValue("https://media.example.test/signed") },
}));
vi.mock("../src/modules/auth/auth.service.js", () => ({ authService: { validateSession: mocks.validateSession } }));

import { storageService } from "../src/services/storage.service.js";
import { app } from "../src/app.js";

import { SESSION_COOKIE_NAME } from "../src/modules/auth/auth.cookie.js";
import * as service from "../src/modules/vocabulary/vocabulary.service.js";
import * as schemas from "../src/modules/vocabulary/vocabulary.schemas.js";

const id = "7de05f79-21eb-4a2c-bd75-899a63fbb843";
const lessonId = "bce05f79-21eb-4a2c-bd75-899a63fbb843";
const item = () => ({
  id, termKaqchikel: "utz", translationSpanish: "bueno", meaning: null, examples: null,
  exampleKaqchikel: "utz", exampleSpanish: "bueno", notes: null, phoneticGuide: null, ipa: null,
  isActive: true, createdAt: new Date(), updatedAt: new Date(),
  category: null, variant: null, pronunciationMedia: null, imageMedia: null,
});
const cookie = () => [`${SESSION_COOKIE_NAME}=test-session`];
const query = () => schemas.listVocabularyQuerySchema.parse({});

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(storageService.createAccessUrl).mockResolvedValue("https://media.example.test/signed");
  mocks.db.$transaction.mockImplementation(async (operation) => typeof operation === "function" ? operation(mocks.db) : Promise.all(operation));
  mocks.validateSession.mockResolvedValue({ user: { id, role: "ADMIN" } });
  mocks.db.vocabularyItem.findUnique.mockResolvedValue(item());
  mocks.db.vocabularyItem.findFirst.mockResolvedValue(item());
  mocks.db.vocabularyItem.create.mockResolvedValue(item());
  mocks.db.vocabularyItem.update.mockResolvedValue(item());
  mocks.db.vocabularyItem.findMany.mockResolvedValue([item()]);
  mocks.db.vocabularyItem.count.mockResolvedValue(1);
  mocks.db.lesson.findFirst.mockResolvedValue({ id: lessonId });
  mocks.db.lessonVocabulary.findMany.mockResolvedValue([]);
});

describe("validaciones de vocabulario", () => {
  it("acepta términos y guía fonética, limita columnas nativas", () => {
    expect(schemas.createVocabularySchema.parse({ termKaqchikel: " utz ", translationEs: "bueno" })).toMatchObject({ termKaqchikel: "utz", isActive: false });
    expect(schemas.createVocabularySchema.safeParse({ termKaqchikel: "a".repeat(201), translationEs: "bueno" }).success).toBe(false);
    expect(schemas.createVocabularySchema.safeParse({ termKaqchikel: "utz", translationEs: "b".repeat(256) }).success).toBe(false);
  });
  it("rechaza UUID inválidos, campos desconocidos y edición vacía", () => {
    for (const input of [{}, { categoryId: "no" }, { objectKey: "private" }])
      expect(schemas.updateVocabularySchema.safeParse(input).success).toBe(false);
    expect(schemas.updateVocabularySchema.parse({ description: null })).toEqual({ description: null });
    expect(schemas.updateVocabularySchema.parse({ termKaqchikel: "utz" })).not.toHaveProperty("isActive");
  });
  it("valida paginación, booleanos, códigos y orden", () => {
    expect(schemas.listVocabularyQuerySchema.parse({ isActive: "false" }).isActive).toBe(false);
    for (const input of [{ page: 0 }, { pageSize: 51 }, { isActive: "yes" }])
      expect(schemas.listVocabularyQuerySchema.safeParse(input).success).toBe(false);
    expect(schemas.lessonVocabularySchema.safeParse({ position: -1 }).success).toBe(false);
    expect(schemas.categorySchema.safeParse({ name: "Colores", slug: "no válido" }).success).toBe(false);
    expect(schemas.variantSchema.safeParse({ name: "Central", code: "central", region: "Chimaltenango" }).success).toBe(true);
  });
});

describe("rutas y permisos reales", () => {
  it("exige sesión en todos los routers", async () => {
    for (const path of ["/admin/vocabulary", "/vocabulary", `/admin/lessons/${id}/vocabulary`, `/lessons/${id}/vocabulary`])
      await request(app).get(`/api/v1${path}`).expect(401);
    expect(mocks.db.vocabularyItem.findMany).not.toHaveBeenCalled();
  });
  it("rechaza estudiantes en todas las escrituras administrativas", async () => {
    mocks.validateSession.mockResolvedValue({ user: { id, role: "USER" } });
    const root = "/api/v1/admin/vocabulary";
    for (const [method, path] of [
      ["post", root], ["patch", `${root}/${id}`], ["delete", `${root}/${id}`],
      ["post", `${root}/categories`], ["patch", `${root}/categories/${id}`], ["delete", `${root}/categories/${id}`],
      ["post", `${root}/variants`], ["patch", `${root}/variants/${id}`], ["delete", `${root}/variants/${id}`],
      ["put", `/api/v1/admin/lessons/${lessonId}/vocabulary/${id}`],
      ["delete", `/api/v1/admin/lessons/${lessonId}/vocabulary/${id}`],
    ]) await (request(app) as any)[method!](path!).set("Cookie", cookie()).send({}).expect(403);
  });
  it("crea con ADMIN y registra auditoría", async () => {
    const response = await request(app).post("/api/v1/admin/vocabulary").set("Cookie", cookie())
      .send({ termKaqchikel: "utz", translationEs: "bueno" }).expect(201);
    expect(response.body.data.vocabulary.translationEs).toBe("bueno");
    expect(mocks.db.vocabularyItem.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ translationSpanish: "bueno", isActive: false }),
    }));
    expect(mocks.db.auditLog.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ actorUserId: id, action: "VOCABULARY_CREATED" }) }));
  });
  it("devuelve errores de validación HTTP 400", async () => {
    await request(app).patch(`/api/v1/admin/vocabulary/${id}`).set("Cookie", cookie()).send({}).expect(400);
    await request(app).get("/api/v1/vocabulary/not-uuid").set("Cookie", cookie()).expect(400);
    await request(app).get("/api/v1/vocabulary?pageSize=100").set("Cookie", cookie()).expect(400);
  });
});

describe("servicio de vocabulario", () => {
  it("busca en ambos idiomas con paginación y filtro activo obligatorio para estudiantes", async () => {
    await service.listVocabulary({ ...query(), q: "UTZ", page: 2, isActive: false }, true);
    expect(mocks.db.vocabularyItem.findMany).toHaveBeenCalledWith(expect.objectContaining({
      skip: 20, take: 20, where: expect.objectContaining({ isActive: true, OR: [
        { termKaqchikel: { contains: "UTZ", mode: "insensitive" } },
        { translationSpanish: { contains: "UTZ", mode: "insensitive" } },
      ] }),
    }));
  });
  it("oculta inactivos en detalle", async () => {
    mocks.db.vocabularyItem.findFirst.mockResolvedValue(null);
    await expect(service.getVocabulary(id, true)).rejects.toMatchObject({ statusCode: 404 });
    expect(mocks.db.vocabularyItem.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id, isActive: true } }));
  });
  it("edita parcialmente sin reiniciar otros campos", async () => {
    await service.updateVocabulary(id, id, { description: null });
    expect(mocks.db.vocabularyItem.update).toHaveBeenCalledWith(expect.objectContaining({ data: { meaning: null } }));
    await service.updateVocabulary(id, id, { isActive: false });
    expect(mocks.db.vocabularyItem.update).toHaveBeenLastCalledWith(expect.objectContaining({ data: { isActive: false } }));
  });
  it.each(["categoryId", "variantId", "pronunciationMediaId", "imageMediaId"] as const)("rechaza referencia inexistente %s", async (key) => {
    await expect(service.updateVocabulary(id, id, { [key]: id })).rejects.toMatchObject({ statusCode: 400 });
    expect(mocks.db.vocabularyItem.update).not.toHaveBeenCalled();
    expect(mocks.db.auditLog.create).not.toHaveBeenCalled();
  });
  it("comprueba tipo y disponibilidad multimedia", async () => {
    mocks.db.mediaFile.findFirst.mockResolvedValue({ id });
    await service.updateVocabulary(id, id, { pronunciationMediaId: id, imageMediaId: lessonId });
    expect(mocks.db.mediaFile.findFirst).toHaveBeenCalledWith({ where: { id, mediaType: "AUDIO", status: "AVAILABLE", deletedAt: null } });
    expect(mocks.db.mediaFile.findFirst).toHaveBeenCalledWith({ where: { id: lessonId, mediaType: "IMAGE", status: "AVAILABLE", deletedAt: null } });
  });
  it("no expone almacenamiento y oculta archivos retirados y catálogos inactivos", async () => {
    mocks.db.vocabularyItem.findFirst.mockResolvedValue({ ...item(),
      pronunciationMedia: { id, mediaType: "AUDIO", mimeType: "audio/mpeg", status: "AVAILABLE", deletedAt: null, objectKey: "secret", bucket: "private" },
      imageMedia: { id, status: "DELETED", deletedAt: new Date() }, category: { id, isActive: false },
    });
    const result = await service.getVocabulary(id, true);
    expect(result.pronunciationMedia).toEqual({ id, mediaType: "AUDIO", mimeType: "audio/mpeg", accessUrl: `/api/v1/media/${id}/access` });
    expect(result.imageMedia).toBeNull();
    expect(result.category).toBeNull();
    expect(JSON.stringify(result)).not.toContain("secret");
  });
  it("maneja término inexistente y conflicto de unicidad", async () => {
    mocks.db.vocabularyItem.findUnique.mockResolvedValue(null);
    await expect(service.updateVocabulary(id, id, { isActive: false })).rejects.toMatchObject({ statusCode: 404 });
    mocks.db.vocabularyCategory.create.mockRejectedValue(new Prisma.PrismaClientKnownRequestError("conflict", { code: "P2002", clientVersion: "7.8.0" }));
    await expect(service.saveCatalog(id, "categories", undefined, { name: "Colores", slug: "colores", isActive: true })).rejects.toMatchObject({ statusCode: 409 });
  });
});

describe("catálogos y relaciones por lección", () => {
  it.each(["categories", "variants"] as const)("mantiene y desactiva %s con auditoría", async (kind) => {
    const delegate = kind === "categories" ? mocks.db.vocabularyCategory : mocks.db.vocabularyVariant;
    delegate.findUnique.mockResolvedValue({ id, isActive: true });
    delegate.update.mockResolvedValue({ id, isActive: false });
    await service.saveCatalog(id, kind, id, { isActive: false });
    expect(delegate.update).toHaveBeenCalledWith({ where: { id }, data: { isActive: false } });
    expect(mocks.db.auditLog.create).toHaveBeenCalled();
    delegate.findMany.mockResolvedValue([]);
    delegate.count.mockResolvedValue(0);
    await service.listCatalog(kind, query(), true);
    expect(delegate.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { isActive: true } }));
  });
  it("exige publicación de toda la jerarquía y conserva orden", async () => {
    await service.listLessonVocabulary(lessonId, true);
    expect(mocks.db.lesson.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: lessonId, deletedAt: null, status: "PUBLISHED", unit: {
        deletedAt: null, status: "PUBLISHED", level: { deletedAt: null, status: "PUBLISHED", course: { deletedAt: null, status: "PUBLISHED" } },
      } },
    }));
    expect(mocks.db.lessonVocabulary.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { lessonId, isVisible: true, vocabulary: { isActive: true } }, orderBy: [{ position: "asc" }, { id: "asc" }],
    }));
  });
  it("devuelve 404 en lecciones no disponibles", async () => {
    mocks.db.lesson.findFirst.mockResolvedValue(null);
    await expect(service.listLessonVocabulary(lessonId, true)).rejects.toMatchObject({ statusCode: 404 });
    expect(mocks.db.lessonVocabulary.findMany).not.toHaveBeenCalled();
  });
  it("asocia, reordena y oculta sin borrar vínculos", async () => {
    mocks.db.lessonVocabulary.upsert.mockResolvedValue({ id, lessonId, vocabularyId: id, position: 3, isVisible: true });
    mocks.db.lessonVocabulary.findUnique.mockResolvedValue({ id, position: 1, isVisible: true });
    await service.saveLessonVocabulary(id, lessonId, id, { position: 3, isVisible: true });
    expect(mocks.db.lessonVocabulary.upsert).toHaveBeenCalledWith(expect.objectContaining({ update: { position: 3, isVisible: true } }));
    mocks.db.lessonVocabulary.update.mockResolvedValue({ id, isVisible: false });
    await service.saveLessonVocabulary(id, lessonId, id, null);
    expect(mocks.db.lessonVocabulary.update).toHaveBeenCalledWith(expect.objectContaining({ data: { isVisible: false } }));
    expect(mocks.db.auditLog.create).toHaveBeenCalledTimes(2);
  });
  it("rechaza vínculo o palabra inexistentes", async () => {
    mocks.db.lessonVocabulary.findUnique.mockResolvedValue(null);
    await expect(service.saveLessonVocabulary(id, lessonId, id, null)).rejects.toMatchObject({ statusCode: 404 });
    mocks.db.vocabularyItem.findUnique.mockResolvedValue(null);
    await expect(service.saveLessonVocabulary(id, lessonId, id, { position: 0, isVisible: true })).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("multimedia y montaje en app.ts", () => {
  it("reutiliza acceso firmado sin exponer campos privados de MediaFile", async () => {
    mocks.db.mediaFile.findFirst.mockResolvedValue({
      id, originalName: "utz.mp3", mediaType: "AUDIO", mimeType: "audio/mpeg", sizeBytes: 123,
      status: "AVAILABLE", objectKey: "private-object-key", bucket: "private-bucket",
      uploadedBy: { email: "private@example.test" }, metadata: { private: true },
    });
    const response = await request(app).get(`/api/v1/media/${id}/access`).set("Cookie", cookie()).expect(200);
    expect(response.body.data.url).toBe("https://media.example.test/signed");
    for (const key of ["objectKey", "bucket", "uploadedBy", "metadata"])
      expect(response.body.data.media).not.toHaveProperty(key);
  });
  it.each(["categories", "variants"] as const)("permite consultar %s con sesión de estudiante", async (kind) => {
    mocks.validateSession.mockResolvedValue({ user: { id, role: "USER" } });
    const delegate = kind === "categories" ? mocks.db.vocabularyCategory : mocks.db.vocabularyVariant;
    delegate.findMany.mockResolvedValue([]);
    delegate.count.mockResolvedValue(0);
    await request(app).get(`/api/v1/vocabulary/${kind}`).set("Cookie", cookie()).expect(200);
  });
  it("permite consultar vocabulario activo y relaciones publicadas con rol USER", async () => {
    mocks.validateSession.mockResolvedValue({ user: { id, role: "USER" } });
    await request(app).get("/api/v1/vocabulary").set("Cookie", cookie()).expect(200);
    await request(app).get(`/api/v1/vocabulary/${id}`).set("Cookie", cookie()).expect(200);
    await request(app).get(`/api/v1/lessons/${lessonId}/vocabulary`).set("Cookie", cookie()).expect(200);
  });
  it.each(["categories", "variants"] as const)("rechaza PATCH vacío de %s sin alterar isActive", async (kind) => {
    await request(app).patch(`/api/v1/admin/vocabulary/${kind}/${id}`).set("Cookie", cookie()).send({}).expect(400);
    const schema = kind === "categories" ? schemas.updateCategorySchema : schemas.updateVariantSchema;
    expect(schema.parse({ name: "Nuevo nombre" })).toEqual({ name: "Nuevo nombre" });
  });
});
