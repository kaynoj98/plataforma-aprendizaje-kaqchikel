import type { RequestHandler } from "express";
import type { ListVocabularyQuery, CatalogKind } from "./vocabulary.schemas.js";
import * as service from "./vocabulary.service.js";

type Params = { vocabularyId: string; lessonId: string; id: string };
const params = (req: Parameters<RequestHandler>[0]) => req.validatedParams as Params;
const actor = (req: Parameters<RequestHandler>[0]) => req.auth!.user.id;
const query = (req: Parameters<RequestHandler>[0]) => req.validatedQuery as ListVocabularyQuery;

export const createVocabularyController: RequestHandler = async (req, res) => {
  res.status(201).json({ success: true, data: { vocabulary: await service.createVocabulary(actor(req), req.body) } });
};
export const listVocabularyController = (student: boolean): RequestHandler => async (req, res) => {
  res.json({ success: true, data: await service.listVocabulary(query(req), student) });
};
export const getVocabularyController = (student: boolean): RequestHandler => async (req, res) => {
  res.json({ success: true, data: { vocabulary: await service.getVocabulary(params(req).vocabularyId, student) } });
};
export const updateVocabularyController = (deactivate = false): RequestHandler => async (req, res) => {
  res.json({ success: true, data: { vocabulary: await service.updateVocabulary(actor(req), params(req).vocabularyId,
    deactivate ? { isActive: false } : req.body) } });
};
export const listCatalogController = (kind: CatalogKind, student: boolean): RequestHandler => async (req, res) => {
  res.json({ success: true, data: await service.listCatalog(kind, query(req), student) });
};
export const saveCatalogController = (kind: CatalogKind, create = false, deactivate = false): RequestHandler => async (req, res) => {
  res.status(create ? 201 : 200).json({ success: true, data: {
    [kind === "categories" ? "category" : "variant"]: await service.saveCatalog(actor(req), kind,
      create ? undefined : params(req).id, deactivate ? { isActive: false } : req.body),
  } });
};
export const listLessonVocabularyController = (student: boolean): RequestHandler => async (req, res) => {
  res.json({ success: true, data: { items: await service.listLessonVocabulary(params(req).lessonId, student) } });
};
export const saveLessonVocabularyController = (hide = false): RequestHandler => async (req, res) => {
  const { lessonId, vocabularyId } = params(req);
  res.json({ success: true, data: { link: await service.saveLessonVocabulary(actor(req), lessonId, vocabularyId, hide ? null : req.body) } });
};
