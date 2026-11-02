import { Router } from "express";
import { Role } from "../../generated/prisma/enums.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { validateBody } from "../../middlewares/validate-body.js";
import { validateQuery } from "../../middlewares/validate-query.js";
import { validateParams } from "../../middlewares/validate-params.js";
import * as schema from "./vocabulary.schemas.js";
import * as controller from "./vocabulary.controller.js";

export const adminVocabularyRouter = Router();
export const publicVocabularyRouter = Router();
export const adminLessonVocabularyRouter = Router();
export const lessonVocabularyRouter = Router();

adminVocabularyRouter.use(authenticate, authorize(Role.ADMIN));
publicVocabularyRouter.use(authenticate);
adminLessonVocabularyRouter.use(authenticate, authorize(Role.ADMIN));
lessonVocabularyRouter.use(authenticate);

for (const kind of ["categories", "variants"] as const) {
  const create = kind === "categories" ? schema.categorySchema : schema.variantSchema;
  const update = kind === "categories" ? schema.updateCategorySchema : schema.updateVariantSchema;
  adminVocabularyRouter.get(`/${kind}`, validateQuery(schema.listVocabularyQuerySchema), controller.listCatalogController(kind, false));
  publicVocabularyRouter.get(`/${kind}`, validateQuery(schema.listVocabularyQuerySchema), controller.listCatalogController(kind, true));
  adminVocabularyRouter.post(`/${kind}`, validateBody(create), controller.saveCatalogController(kind, true));
  adminVocabularyRouter.patch(`/${kind}/:id`, validateParams(schema.catalogParamsSchema), validateBody(update), controller.saveCatalogController(kind));
  adminVocabularyRouter.delete(`/${kind}/:id`, validateParams(schema.catalogParamsSchema), controller.saveCatalogController(kind, false, true));
}
adminVocabularyRouter.post("/", validateBody(schema.createVocabularySchema), controller.createVocabularyController);
adminVocabularyRouter.get("/", validateQuery(schema.listVocabularyQuerySchema), controller.listVocabularyController(false));
publicVocabularyRouter.get("/", validateQuery(schema.listVocabularyQuerySchema), controller.listVocabularyController(true));
adminVocabularyRouter.get("/:vocabularyId", validateParams(schema.vocabularyParamsSchema), controller.getVocabularyController(false));
publicVocabularyRouter.get("/:vocabularyId", validateParams(schema.vocabularyParamsSchema), controller.getVocabularyController(true));
adminVocabularyRouter.patch("/:vocabularyId", validateParams(schema.vocabularyParamsSchema), validateBody(schema.updateVocabularySchema), controller.updateVocabularyController());
adminVocabularyRouter.delete("/:vocabularyId", validateParams(schema.vocabularyParamsSchema), controller.updateVocabularyController(true));

adminLessonVocabularyRouter.get("/:lessonId/vocabulary", validateParams(schema.lessonParamsSchema), controller.listLessonVocabularyController(false));
lessonVocabularyRouter.get("/:lessonId/vocabulary", validateParams(schema.lessonParamsSchema), controller.listLessonVocabularyController(true));
adminLessonVocabularyRouter.put("/:lessonId/vocabulary/:vocabularyId", validateParams(schema.lessonVocabularyParamsSchema),
  validateBody(schema.lessonVocabularySchema), controller.saveLessonVocabularyController());
adminLessonVocabularyRouter.delete("/:lessonId/vocabulary/:vocabularyId", validateParams(schema.lessonVocabularyParamsSchema), controller.saveLessonVocabularyController(true));
