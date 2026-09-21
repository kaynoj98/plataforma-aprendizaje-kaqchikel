import { Router } from "express";

import { Role } from "../../generated/prisma/client.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { validateBody } from "../../middlewares/validate-body.js";
import { validateParams } from "../../middlewares/validate-params.js";
import { validateQuery } from "../../middlewares/validate-query.js";

import {
  archiveLesson,
  createLesson,
  createLevel,
  createUnit,
  deleteLesson,
  deleteLevel,
  deleteUnit,
  getAdminLesson,
  getCourseStructure,
  getLesson,
  listLessons,
  listLevels,
  listUnits,
  publishLesson,
  unpublishLesson,
  updateLesson,
  updateLevel,
  updateUnit,
  archiveLevel,
  archiveUnit,
  publishLevel,
  publishUnit,
  unpublishLevel,
  unpublishUnit,
} from "./learning-structure.controller.js";

import {
  courseIdParamsSchema,
  createLessonSchema,
  createLevelSchema,
  createUnitSchema,
  lessonIdParamsSchema,
  levelIdParamsSchema,
  listChildrenQuerySchema,
  unitIdParamsSchema,
  updateLessonSchema,
  updateLevelSchema,
  updateUnitSchema,
} from "./learning-structure.schemas.js";

export const learningRouter = Router();
export const publicLessonRouter = Router();
export const adminLearningRouter = Router();

learningRouter.get(
  "/:courseId/structure",
  authenticate,
  validateParams(courseIdParamsSchema),
  getCourseStructure,
);

publicLessonRouter.get(
  "/:lessonId",
  authenticate,
  validateParams(lessonIdParamsSchema),
  getLesson,
);

adminLearningRouter.get(
  "/courses/:courseId/levels",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(courseIdParamsSchema),
  validateQuery(listChildrenQuerySchema),
  listLevels,
);

adminLearningRouter.post(
  "/courses/:courseId/levels",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(courseIdParamsSchema),
  validateBody(createLevelSchema),
  createLevel,
);

adminLearningRouter.patch(
  "/levels/:levelId",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(levelIdParamsSchema),
  validateBody(updateLevelSchema),
  updateLevel,
);

adminLearningRouter.delete(
  "/levels/:levelId",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(levelIdParamsSchema),
  deleteLevel,
);

adminLearningRouter.post(
  "/levels/:levelId/publish",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(levelIdParamsSchema),
  publishLevel,
);

adminLearningRouter.post(
  "/levels/:levelId/unpublish",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(levelIdParamsSchema),
  unpublishLevel,
);

adminLearningRouter.post(
  "/levels/:levelId/archive",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(levelIdParamsSchema),
  archiveLevel,
);

adminLearningRouter.get(
  "/levels/:levelId/units",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(levelIdParamsSchema),
  validateQuery(listChildrenQuerySchema),
  listUnits,
);

adminLearningRouter.post(
  "/levels/:levelId/units",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(levelIdParamsSchema),
  validateBody(createUnitSchema),
  createUnit,
);

adminLearningRouter.patch(
  "/units/:unitId",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(unitIdParamsSchema),
  validateBody(updateUnitSchema),
  updateUnit,
);

adminLearningRouter.delete(
  "/units/:unitId",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(unitIdParamsSchema),
  deleteUnit,
);

adminLearningRouter.post(
  "/units/:unitId/publish",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(unitIdParamsSchema),
  publishUnit,
);

adminLearningRouter.post(
  "/units/:unitId/unpublish",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(unitIdParamsSchema),
  unpublishUnit,
);

adminLearningRouter.post(
  "/units/:unitId/archive",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(unitIdParamsSchema),
  archiveUnit,
);

adminLearningRouter.get(
  "/units/:unitId/lessons",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(unitIdParamsSchema),
  validateQuery(listChildrenQuerySchema),
  listLessons,
);

adminLearningRouter.post(
  "/units/:unitId/lessons",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(unitIdParamsSchema),
  validateBody(createLessonSchema),
  createLesson,
);

adminLearningRouter.get(
  "/lessons/:lessonId",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(lessonIdParamsSchema),
  getAdminLesson,
);

adminLearningRouter.patch(
  "/lessons/:lessonId",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(lessonIdParamsSchema),
  validateBody(updateLessonSchema),
  updateLesson,
);

adminLearningRouter.delete(
  "/lessons/:lessonId",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(lessonIdParamsSchema),
  deleteLesson,
);

adminLearningRouter.post(
  "/lessons/:lessonId/publish",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(lessonIdParamsSchema),
  publishLesson,
);

adminLearningRouter.post(
  "/lessons/:lessonId/unpublish",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(lessonIdParamsSchema),
  unpublishLesson,
);

adminLearningRouter.post(
  "/lessons/:lessonId/archive",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(lessonIdParamsSchema),
  archiveLesson,
);
