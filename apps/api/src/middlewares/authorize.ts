import type { RequestHandler } from "express";

import { AppError } from "../errors/app-error.js";
import type { Role } from "../generated/prisma/client.js";

export function authorize(...allowedRoles: Role[]): RequestHandler {
  return (request, _response, next) => {
    if (!request.auth) {
      next(
        new AppError(
          401,
          "AUTHENTICATION_REQUIRED",
          "Debes iniciar sesión para acceder a este recurso.",
        ),
      );

      return;
    }

    if (!allowedRoles.includes(request.auth.user.role)) {
      next(
        new AppError(
          403,
          "INSUFFICIENT_PERMISSIONS",
          "No tienes permisos para realizar esta acción.",
        ),
      );

      return;
    }

    next();
  };
}
