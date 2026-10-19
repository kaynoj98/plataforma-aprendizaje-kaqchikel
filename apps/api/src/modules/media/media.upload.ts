import multer from "multer";

import { tmpdir } from "node:os";

import { env } from "../../config/env.js";
import { AppError } from "../../errors/app-error.js";

import { MEDIA_TYPE_BY_MIME } from "./media.constants.js";

export const uploadSingleMedia = multer({
  dest: tmpdir(),

  limits: {
    fileSize: env.MEDIA_MAX_UPLOAD_MB * 1024 * 1024,

    files: 1,
  },

  fileFilter(_request, file, callback) {
    if (!MEDIA_TYPE_BY_MIME[file.mimetype]) {
      callback(
        new AppError(
          400,
          "UNSUPPORTED_MEDIA_TYPE",
          "El tipo de archivo no está permitido.",
        ),
      );

      return;
    }

    callback(null, true);
  },
}).single("file");
