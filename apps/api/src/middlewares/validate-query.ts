import type { RequestHandler } from "express";
import * as z from "zod";

import { AppError } from "../errors/app-error.js";

export function validateQuery(schema: z.ZodType): RequestHandler {
  return (request, _response, next) => {
    const result = schema.safeParse(request.query);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.length > 0 ? issue.path.join(".") : "query",
        message: issue.message,
      }));

      next(
        new AppError(
          400,
          "VALIDATION_ERROR",
          "Los parámetros de consulta no son válidos.",
          details,
        ),
      );

      return;
    }

    request.validatedQuery = result.data;

    next();
  };
}
