import type { RequestHandler } from "express";

import { AppError } from "../errors/app-error.js";
import { getSessionTokenFromRequest } from "../modules/auth/auth.cookie.js";
import { authService } from "../modules/auth/auth.service.js";

export const authenticate: RequestHandler = async (
  request,
  _response,
  next,
) => {
  try {
    const sessionToken = getSessionTokenFromRequest(request);

    if (!sessionToken) {
      throw new AppError(
        401,
        "AUTHENTICATION_REQUIRED",
        "Debes iniciar sesión para acceder a este recurso.",
      );
    }

    request.auth = await authService.validateSession(sessionToken);

    next();
  } catch (error) {
    next(error);
  }
};
