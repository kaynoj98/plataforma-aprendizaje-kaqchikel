import type { RequestHandler } from "express";

import { AppError } from "../../errors/app-error.js";

import {
  getSessionCookieOptions,
  getSessionTokenFromRequest,
  SESSION_COOKIE_NAME,
} from "./auth.cookie.js";
import type { LoginInput, RegisterInput } from "./auth.schemas.js";
import { authService } from "./auth.service.js";

export const register: RequestHandler = async (request, response) => {
  const input = request.body as RegisterInput;

  const user = await authService.register(input);

  response.status(201).json({
    success: true,
    data: {
      user,
    },
    message:
      "La cuenta fue creada. Debes confirmar tu correo electrónico antes de iniciar sesión.",
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
