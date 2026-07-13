import { Router } from "express";

import { Role } from "../../generated/prisma/client.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { validateBody } from "../../middlewares/validate-body.js";
import { validateParams } from "../../middlewares/validate-params.js";
import { validateQuery } from "../../middlewares/validate-query.js";

import {
  archiveCourse,
  createCourse,
  deleteCourse,
  getAdminCourseById,
  getPublishedCourseById,
  getPublicCourseBySlug,
  listAdminCourses,
  listPublishedCourses,
  listPublicCourses,
  publishCourse,
  unpublishCourse,
  updateCourse,
} from "./course.controller.js";
import {
  adminListCoursesQuerySchema,
  courseIdParamsSchema,
  courseSlugParamsSchema,
  createCourseSchema,
  publicListCoursesQuerySchema,
  updateCourseSchema,
} from "./course.schemas.js";

export const publicCourseRouter = Router();
export const courseRouter = Router();
export const adminCourseRouter = Router();

publicCourseRouter.get(
  "/",
  validateQuery(publicListCoursesQuerySchema),
  listPublicCourses,
);

publicCourseRouter.get(
  "/:slug",
  validateParams(courseSlugParamsSchema),
  getPublicCourseBySlug,
);

courseRouter.get(
  "/",
  authenticate,
  validateQuery(publicListCoursesQuerySchema),
  listPublishedCourses,
);

courseRouter.get(
  "/:courseId",
  authenticate,
  validateParams(courseIdParamsSchema),
  getPublishedCourseById,
);

adminCourseRouter.get(
  "/",
  authenticate,
  authorize(Role.ADMIN),
  validateQuery(adminListCoursesQuerySchema),
  listAdminCourses,
);

adminCourseRouter.post(
  "/",
  authenticate,
  authorize(Role.ADMIN),
  validateBody(createCourseSchema),
  createCourse,
);

adminCourseRouter.get(
  "/:courseId",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(courseIdParamsSchema),
  getAdminCourseById,
);

adminCourseRouter.patch(
  "/:courseId",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(courseIdParamsSchema),
  validateBody(updateCourseSchema),
  updateCourse,
);

adminCourseRouter.delete(
  "/:courseId",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(courseIdParamsSchema),
  deleteCourse,
);

adminCourseRouter.post(
  "/:courseId/publish",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(courseIdParamsSchema),
  publishCourse,
);

adminCourseRouter.post(
  "/:courseId/unpublish",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(courseIdParamsSchema),
  unpublishCourse,
);

adminCourseRouter.post(
  "/:courseId/archive",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(courseIdParamsSchema),
  archiveCourse,
);
