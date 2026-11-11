import { Router } from "express";
import { z } from "zod";
import { Role } from "../../generated/prisma/client.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { validateBody } from "../../middlewares/validate-body.js";
import { validateParams } from "../../middlewares/validate-params.js";
import { courseIdParamsSchema, lessonIdParamsSchema } from "../learning-structure/learning-structure.schemas.js";
import { completeLesson, enroll, getProgress, listEnrollments } from "./enrollment.service.js";

export const enrollmentRouter = Router();
enrollmentRouter.use(authenticate, authorize(Role.USER));

const courseParams = validateParams(courseIdParamsSchema);
const lessonParams = validateParams(courseIdParamsSchema.extend(lessonIdParamsSchema.shape));
const emptyBody = validateBody(z.object({}).strict().optional());

enrollmentRouter.get("/", async (req, res) => {
  const enrollments = await listEnrollments(req.auth!.user.id);
  res.json({ success: true, data: { enrollments } });
});

enrollmentRouter.get("/:courseId", courseParams, async (req, res) => {
  const { courseId } = req.validatedParams as z.infer<typeof courseIdParamsSchema>;
  const progress = await getProgress(req.auth!.user.id, courseId);
  res.json({ success: true, data: { progress } });
});

enrollmentRouter.put("/:courseId", courseParams, emptyBody, async (req, res) => {
  const { courseId } = req.validatedParams as z.infer<typeof courseIdParamsSchema>;
  await enroll(req.auth!.user.id, courseId);
  res.sendStatus(204);
});

enrollmentRouter.put("/:courseId/lessons/:lessonId", lessonParams, emptyBody, async (req, res) => {
  const { courseId, lessonId } = req.validatedParams as { courseId: string; lessonId: string };
  await completeLesson(req.auth!.user.id, courseId, lessonId);
  res.sendStatus(204);
});
