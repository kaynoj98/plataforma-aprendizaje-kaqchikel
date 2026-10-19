import type { ErrorRequestHandler } from "express";
import multer from "multer";

import { AppError } from "../errors/app-error.js";

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      response.status(413).json({
        success: false,

        error: {
          code: "FILE_TOO_LARGE",

          message: "El archivo supera el tamaño máximo permitido.",
        },
      });

      return;
    }

    response.status(400).json({
      success: false,

      error: {
        code: "UPLOAD_ERROR",

        message: "No fue posible procesar el archivo enviado.",
      },
    });

    return;
  }

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
