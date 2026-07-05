import type { RequestHandler } from "express";

import { AppError } from "../../errors/app-error.js";

import {
  getSessionCookieOptions,
  getSessionTokenFromRequest,
  SESSION_COOKIE_NAME,
} from "./auth.cookie.js";

import type {
  EmailRequestInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "./auth.schemas.js";

import { authService } from "./auth.service.js";

export const register: RequestHandler = async (request, response) => {
  const input = request.body as RegisterInput;

  const result = await authService.register(input);

  response.status(201).json({
    success: true,
    data: {
      user: result.user,
      emailSent: result.emailSent,
    },
    message: result.emailSent
      ? "La cuenta fue creada. Debes confirmar tu correo electrónico antes de iniciar sesión."
      : "La cuenta fue creada, pero no fue posible enviar el correo. Solicita un nuevo enlace de confirmación.",
  });
};

export const login: RequestHandler = async (request, response) => {
  const input = request.body as LoginInput;

  const result = await authService.login(input, {
    ipAddress: request.ip ?? null,
    userAgent: request.get("user-agent") ?? null,
  });

  response.cookie(
    SESSION_COOKIE_NAME,
    result.sessionToken,
    getSessionCookieOptions(result.expiresAt),
  );

  response.status(200).json({
    success: true,
    data: {
      user: result.user,
      session: {
        expiresAt: result.expiresAt,
      },
    },
  });
};

export const getSession: RequestHandler = async (request, response) => {
  if (!request.auth) {
    throw new AppError(401, "AUTHENTICATION_REQUIRED", "Debes iniciar sesión.");
  }

  response.status(200).json({
    success: true,
    data: {
      authenticated: true,
      user: request.auth.user,
      session: {
        id: request.auth.sessionId,
        expiresAt: request.auth.expiresAt,
      },
    },
  });
};

export const logout: RequestHandler = async (request, response) => {
  const sessionToken = getSessionTokenFromRequest(request);

  await authService.logout(sessionToken);

  response.clearCookie(SESSION_COOKIE_NAME, getSessionCookieOptions());

  response.status(200).json({
    success: true,
    message: "La sesión fue cerrada correctamente.",
  });
};

export const logoutAll: RequestHandler = async (request, response) => {
  if (!request.auth) {
    throw new AppError(401, "AUTHENTICATION_REQUIRED", "Debes iniciar sesión.");
  }

  await authService.logoutAll(request.auth.user.id);

  response.clearCookie(SESSION_COOKIE_NAME, getSessionCookieOptions());

  response.status(200).json({
    success: true,
    message: "Todas las sesiones fueron cerradas.",
  });
};

export const verifyEmail: RequestHandler = async (request, response) => {
  const input = request.body as VerifyEmailInput;

  const user = await authService.verifyEmail(input);

  response.status(200).json({
    success: true,

    data: {
      user,
    },

    message: "El correo electrónico fue confirmado correctamente.",
  });
};

export const resendVerification: RequestHandler = async (request, response) => {
  const input = request.body as EmailRequestInput;

  await authService.resendVerification(input);

  response.status(200).json({
    success: true,

    message: "Si la cuenta requiere confirmación, se enviará un nuevo correo.",
  });
};

export const forgotPassword: RequestHandler = async (request, response) => {
  const input = request.body as EmailRequestInput;

  await authService.forgotPassword(input);

  response.status(200).json({
    success: true,

    message:
      "Si existe una cuenta asociada, se enviará un enlace de recuperación.",
  });
};

export const resetPassword: RequestHandler = async (request, response) => {
  const input = request.body as ResetPasswordInput;

  await authService.resetPassword(input);

  response.clearCookie(SESSION_COOKIE_NAME, getSessionCookieOptions());

  response.status(200).json({
    success: true,

    message:
      "La contraseña fue restablecida correctamente. Debes iniciar sesión nuevamente.",
  });
};
