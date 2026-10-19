import { Router } from "express";

import { Role } from "../../generated/prisma/client.js";

import { authenticate } from "../../middlewares/authenticate.js";

import { authorize } from "../../middlewares/authorize.js";

import { validateParams } from "../../middlewares/validate-params.js";

import { validateQuery } from "../../middlewares/validate-query.js";

import {
  accessMedia,
  deleteMedia,
  downloadMedia,
  getAdminMedia,
  listMedia,
  uploadMedia,
} from "./media.controller.js";

import { listMediaQuerySchema, mediaIdParamsSchema } from "./media.schemas.js";

import { uploadSingleMedia } from "./media.upload.js";

export const mediaRouter = Router();

export const adminMediaRouter = Router();

mediaRouter.get(
  "/:mediaId/access",
  authenticate,
  validateParams(mediaIdParamsSchema),
  accessMedia,
);

mediaRouter.get(
  "/:mediaId/download",
  authenticate,
  validateParams(mediaIdParamsSchema),
  downloadMedia,
);

adminMediaRouter.get(
  "/",
  authenticate,
  authorize(Role.ADMIN),
  validateQuery(listMediaQuerySchema),
  listMedia,
);

adminMediaRouter.post(
  "/",
  authenticate,
  authorize(Role.ADMIN),
  uploadSingleMedia,
  uploadMedia,
);

adminMediaRouter.get(
  "/:mediaId",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(mediaIdParamsSchema),
  getAdminMedia,
);

adminMediaRouter.delete(
  "/:mediaId",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(mediaIdParamsSchema),
  deleteMedia,
);
