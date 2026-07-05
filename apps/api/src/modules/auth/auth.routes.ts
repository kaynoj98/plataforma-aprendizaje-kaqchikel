import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate.js";
import {
  loginRateLimiter,
  registerRateLimiter,
} from "../../middlewares/auth-rate-limit.js";
import { validateBody } from "../../middlewares/validate-body.js";

import {
  getSession,
  login,
  logout,
  logoutAll,
  register,
} from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.schemas.js";

export const authRouter = Router();

authRouter.post(
  "/register",
  registerRateLimiter,
  validateBody(registerSchema),
  register,
);

authRouter.post("/login", loginRateLimiter, validateBody(loginSchema), login);

authRouter.get("/session", authenticate, getSession);

authRouter.post("/logout", logout);

authRouter.post("/logout-all", authenticate, logoutAll);
