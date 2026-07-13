import type { RequestHandler } from "express";
import * as z from "zod";

import { AppError } from "../errors/app-error.js";

export function validateParams(schema: z.ZodType): RequestHandler {
  return (request, _response, next) => {
    const result = schema.safeParse(request.params);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.length > 0 ? issue.path.join(".") : "params",
        message: issue.message,
      }));

      next(
        new AppError(
          400,
          "VALIDATION_ERROR",
          "Los parámetros de la ruta no son válidos.",
          details,
        ),
      );

      return;
    }

    request.validatedParams = result.data;

    next();
  };
}
