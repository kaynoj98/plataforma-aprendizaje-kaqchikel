import type { RequestHandler } from "express";
import * as z from "zod";

import { AppError } from "../errors/app-error.js";

export function validateBody(schema: z.ZodType): RequestHandler {
  return (request, _response, next) => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.length > 0 ? issue.path.join(".") : "body",
        message: issue.message,
      }));

      next(
        new AppError(
          400,
          "VALIDATION_ERROR",
          "Los datos enviados no son válidos.",
          details,
        ),
      );

      return;
    }

    request.body = result.data;

    next();
  };
}
