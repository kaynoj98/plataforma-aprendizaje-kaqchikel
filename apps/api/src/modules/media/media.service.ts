import { randomUUID } from "node:crypto";

import { extname } from "node:path";

import { rm } from "node:fs/promises";

import { env } from "../../config/env.js";
import { AppError } from "../../errors/app-error.js";
import { storageService } from "../../services/storage.service.js";

import {
  MAX_BYTES_BY_MEDIA_TYPE,
  MEDIA_TYPE_BY_MIME,
} from "./media.constants.js";

import { mediaRepository } from "./media.repository.js";

import type { ListMediaQuery } from "./media.schemas.js";

function createObjectKey(file: Express.Multer.File, mediaType: string): string {
  const now = new Date();

  const year = now.getUTCFullYear();

  const month = String(now.getUTCMonth() + 1).padStart(2, "0");

  const extension = extname(file.originalname).toLowerCase().slice(0, 15);

  return [
    mediaType.toLowerCase(),
    year,
    month,
    `${randomUUID()}${extension}`,
  ].join("/");
}

export const mediaService = {
  async upload(actorUserId: string, file: Express.Multer.File | undefined) {
    if (!file) {
      throw new AppError(400, "FILE_REQUIRED", "Debes seleccionar un archivo.");
    }

    const mediaType = MEDIA_TYPE_BY_MIME[file.mimetype];

    try {
      if (!mediaType) {
        throw new AppError(
          400,
          "UNSUPPORTED_MEDIA_TYPE",
          "El tipo de archivo no está permitido.",
        );
      }

      const maximumSize = MAX_BYTES_BY_MEDIA_TYPE[mediaType];

      if (file.size > maximumSize) {
        throw new AppError(
          413,
          "FILE_TOO_LARGE",
          `El archivo supera el límite permitido para ${mediaType}.`,
        );
      }

      const objectKey = createObjectKey(file, mediaType);

      await storageService.upload({
        objectKey,
        filePath: file.path,
        contentType: file.mimetype,
      });

      try {
        return await mediaRepository.create({
          uploadedById: actorUserId,

          originalName: file.originalname,

          objectKey,

          bucket: env.S3_BUCKET,

          mediaType,

          mimeType: file.mimetype,

          sizeBytes: file.size,
        });
      } catch (error) {
        await storageService.delete(objectKey).catch((cleanupError) => {
          console.error(
            "No se pudo eliminar un objeto huérfano:",
            cleanupError,
          );
        });

        throw error;
      }
    } finally {
      await rm(file.path, {
        force: true,
      }).catch((error) => {
        console.error("No se pudo limpiar el archivo temporal:", error);
      });
    }
  },

  async list(query: ListMediaQuery) {
    const result = await mediaRepository.list(query);

    return {
      data: result.media,

      pagination: {
        page: query.page,

        pageSize: query.pageSize,

        totalItems: result.totalItems,

        totalPages: Math.ceil(result.totalItems / query.pageSize),
      },
    };
  },

  async getAdmin(mediaId: string) {
    const media = await mediaRepository.findAdminById(mediaId);

    if (!media) {
      throw new AppError(
        404,
        "MEDIA_NOT_FOUND",
        "El archivo multimedia no existe.",
      );
    }

    return media;
  },

  async createAccessUrl(mediaId: string, download = false) {
    const media = await mediaRepository.findById(mediaId);

    if (!media) {
      throw new AppError(
        404,
        "MEDIA_NOT_FOUND",
        "El archivo multimedia no existe o no está disponible.",
      );
    }

    const url = await storageService.createAccessUrl(
      media.objectKey,
      download
        ? {
            downloadName: media.originalName,
          }
        : undefined,
    );

    return {
      media,
      url,

      expiresInMinutes: env.MEDIA_ACCESS_URL_MINUTES,
    };
  },

  async delete(actorUserId: string, mediaId: string) {
    const media = await mediaRepository.findAdminById(mediaId);

    if (!media) {
      throw new AppError(
        404,
        "MEDIA_NOT_FOUND",
        "El archivo multimedia no existe.",
      );
    }

    await storageService.delete(media.objectKey);

    const deleted = await mediaRepository.softDelete({
      actorUserId,
      mediaId,
    });

    if (!deleted) {
      throw new AppError(
        404,
        "MEDIA_NOT_FOUND",
        "El archivo multimedia no existe.",
      );
    }

    return deleted;
  },
};
