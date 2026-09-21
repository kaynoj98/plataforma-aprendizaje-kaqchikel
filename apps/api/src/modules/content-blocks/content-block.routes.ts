import { Router } from "express";

import { Role } from "../../generated/prisma/client.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { validateBody } from "../../middlewares/validate-body.js";
import { validateParams } from "../../middlewares/validate-params.js";

import {
  createContentBlock,
  deleteContentBlock,
  getContentBlock,
  listContentBlocks,
  reorderContentBlocks,
  updateContentBlock,
} from "./content-block.controller.js";
import {
  blockIdParamsSchema,
  createContentBlockSchema,
  lessonIdParamsSchema,
  reorderContentBlocksSchema,
  updateContentBlockSchema,
} from "./content-block.schemas.js";

export const adminContentBlockRouter = Router();

adminContentBlockRouter.get(
  "/lessons/:lessonId/blocks",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(lessonIdParamsSchema),
  listContentBlocks,
);

adminContentBlockRouter.post(
  "/lessons/:lessonId/blocks",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(lessonIdParamsSchema),
  validateBody(createContentBlockSchema),
  createContentBlock,
);

adminContentBlockRouter.patch(
  "/lessons/:lessonId/blocks/reorder",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(lessonIdParamsSchema),
  validateBody(reorderContentBlocksSchema),
  reorderContentBlocks,
);

adminContentBlockRouter.get(
  "/blocks/:blockId",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(blockIdParamsSchema),
  getContentBlock,
);

adminContentBlockRouter.patch(
  "/blocks/:blockId",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(blockIdParamsSchema),
  validateBody(updateContentBlockSchema),
  updateContentBlock,
);

adminContentBlockRouter.delete(
  "/blocks/:blockId",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(blockIdParamsSchema),
  deleteContentBlock,
);
