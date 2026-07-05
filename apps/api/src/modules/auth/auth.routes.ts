import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import {
  loginRateLimiter,
  passwordRecoveryRateLimiter,
  registerRateLimiter,
  resetPasswordRateLimiter,
  verificationRateLimiter,
} from "../../middlewares/auth-rate-limit.js";
import { validateBody } from "../../middlewares/validate-body.js";
import {
  forgotPassword,
  getSession,
  login,
  logout,
  logoutAll,
  register,
  resendVerification,
  resetPassword,
  verifyEmail,
} from "./auth.controller.js";
import {
  emailRequestSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "./auth.schemas.js";

export const authRouter = Router();

authRouter.post(
  "/register",
  registerRateLimiter,
  validateBody(registerSchema),
  register,
);

authRouter.post(
  "/verify-email",
  verificationRateLimiter,
  validateBody(verifyEmailSchema),
  verifyEmail,
);

authRouter.post(
  "/resend-verification",
  verificationRateLimiter,
  validateBody(emailRequestSchema),
  resendVerification,
);

authRouter.post(
  "/forgot-password",
  passwordRecoveryRateLimiter,
  validateBody(emailRequestSchema),
  forgotPassword,
);

authRouter.post(
  "/reset-password",
  resetPasswordRateLimiter,
  validateBody(resetPasswordSchema),
  resetPassword,
);

authRouter.post("/login", loginRateLimiter, validateBody(loginSchema), login);

authRouter.get("/session", authenticate, getSession);

authRouter.post("/logout", logout);

authRouter.post("/logout-all", authenticate, logoutAll);
