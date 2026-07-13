import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { validateBody } from "../../middlewares/validate-body.js";
import { validateParams } from "../../middlewares/validate-params.js";
import { validateQuery } from "../../middlewares/validate-query.js";
import { Role } from "../../generated/prisma/client.js";

import {
  getMe,
  getUserById,
  listUsers,
  updateMe,
  updateUserStatus,
} from "./user.controller.js";
import {
  listUsersQuerySchema,
  updateMeSchema,
  updateUserStatusSchema,
  userIdParamsSchema,
} from "./user.schemas.js";

export const userRouter = Router();
export const adminUserRouter = Router();

userRouter.get("/me", authenticate, getMe);

userRouter.patch("/me", authenticate, validateBody(updateMeSchema), updateMe);

adminUserRouter.get(
  "/",
  authenticate,
  authorize(Role.ADMIN),
  validateQuery(listUsersQuerySchema),
  listUsers,
);

adminUserRouter.get(
  "/:userId",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(userIdParamsSchema),
  getUserById,
);

adminUserRouter.patch(
  "/:userId/status",
  authenticate,
  authorize(Role.ADMIN),
  validateParams(userIdParamsSchema),
  validateBody(updateUserStatusSchema),
  updateUserStatus,
);
