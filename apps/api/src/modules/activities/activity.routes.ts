import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { validateBody } from "../../middlewares/validate-body.js";
import { validateParams } from "../../middlewares/validate-params.js";
import {
  choice,
  createActivity,
  editActivity,
  start,
} from "./activity.schemas.js";
import * as service from "./activity.service.js";

export const activityRouter = Router();
const id = validateParams(z.object({ id: z.uuid() }));
const admin = [authenticate, authorize("ADMIN"), id];
const student = [authenticate, authorize("USER"), id];
const questionParams = validateParams(
  z.object({ id: z.uuid(), questionId: z.uuid() }),
);
for (const kind of ["image", "audio"] as const) {
  activityRouter.get(
    `/activity-attempts/:id/questions/:questionId/${kind}`,
    ...student,
    questionParams,
    async (req, res) => {
      const data = await service.questionMedia(
        String(req.params.id),
        String(req.params.questionId),
        kind,
        req.auth!.user.id,
      );
      res
        .set("Cache-Control", "private, no-store")
        .json({ success: true, data });
    },
  );
  activityRouter.get(
    `/admin/activities/:id/questions/:questionId/${kind}`,
    ...admin,
    questionParams,
    async (req, res) => {
      const data = await service.questionMedia(
        String(req.params.id),
        String(req.params.questionId),
        kind,
      );
      res
        .set("Cache-Control", "private, no-store")
        .json({ success: true, data });
    },
  );
}
const previewBody = z
  .object({ versionId: z.uuid().optional(), choices: z.array(choice).max(50) })
  .strict();
activityRouter.get(
  "/admin/lessons/:id/activities",
  ...admin,
  async (req, res) => {
    res.json({
      data: await service.listActivities(String(req.params.id), true),
    });
  },
);
activityRouter.post(
  "/admin/lessons/:id/activities",
  ...admin,
  validateBody(createActivity),
  async (req, res) => {
    res.status(201).json({
      data: await service.create(
        String(req.params.id),
        req.body.position,
        req.body.definition,
        req.body.requestId,
      ),
    });
  },
);
activityRouter.get("/admin/activities/:id", ...admin, async (req, res) => {
  res
    .set("Cache-Control", "private, no-store")
    .json({ data: await service.readAdmin(String(req.params.id)) });
});
activityRouter.put(
  "/admin/activities/:id",
  ...admin,
  validateBody(editActivity),
  async (req, res) => {
    const { revision, position, isVisible, definition } = req.body;
    res.json({
      data: await service.edit(
        String(req.params.id),
        revision,
        position,
        isVisible,
        definition,
      ),
    });
  },
);
activityRouter.post(
  "/admin/activities/:id/preview",
  ...admin,
  validateBody(previewBody),
  async (req, res) => {
    res.json({
      data: await service.preview(
        String(req.params.id),
        req.body.versionId,
        req.body.choices,
      ),
    });
  },
);
activityRouter.get("/lessons/:id/activities", ...student, async (req, res) => {
  res
    .set("Cache-Control", "private, no-store")
    .json({ data: await service.listActivities(String(req.params.id), false) });
});
activityRouter.post(
  "/activities/:id/attempts",
  ...student,
  validateBody(start),
  async (req, res) => {
    res.json({
      data: await service.begin(
        String(req.params.id),
        req.auth!.user.id,
        req.body.requestId,
      ),
    });
  },
);
activityRouter.post(
  "/activity-attempts/:id/answers",
  ...student,
  validateBody(choice),
  async (req, res) => {
    res.json({
      data: await service.answer(
        String(req.params.id),
        req.auth!.user.id,
        req.body,
      ),
    });
  },
);
