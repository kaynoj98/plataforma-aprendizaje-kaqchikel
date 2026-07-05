import type { ErrorRequestHandler } from "express";

import { AppError } from "../errors/app-error.js";

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details != undefined ? { details: error.details } : {}),
      },
    });
    return;
  }
  console.error("Error no controlado: ", error);

  response.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Ocurrió un error interno en el servidor.",
    },
  });
};
