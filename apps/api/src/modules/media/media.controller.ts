import type { RequestHandler } from "express";

import { AppError } from "../../errors/app-error.js";

import { mediaService } from "./media.service.js";

import type { ListMediaQuery, MediaIdParams } from "./media.schemas.js";

function requireAuthUserId(request: Parameters<RequestHandler>[0]): string {
  if (!request.auth) {
    throw new AppError(401, "AUTHENTICATION_REQUIRED", "Debes iniciar sesión.");
  }

  return request.auth.user.id;
}

export const uploadMedia: RequestHandler = async (request, response) => {
  const actorUserId = requireAuthUserId(request);

  const media = await mediaService.upload(actorUserId, request.file);

  response.status(201).json({
    success: true,

    data: {
      media,
    },

    message: "El archivo fue cargado correctamente.",
  });
};

export const listMedia: RequestHandler = async (request, response) => {
  const query = request.validatedQuery as ListMediaQuery;

  const result = await mediaService.list(query);

  response.status(200).json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
};

export const getAdminMedia: RequestHandler = async (request, response) => {
  const params = request.validatedParams as MediaIdParams;

  const media = await mediaService.getAdmin(params.mediaId);

  response.status(200).json({
    success: true,

    data: {
      media,
    },
  });
};

export const accessMedia: RequestHandler = async (request, response) => {
  const params = request.validatedParams as MediaIdParams;

  const result = await mediaService.createAccessUrl(params.mediaId, false);

  response.status(200).json({
    success: true,

    data: result,
  });
};

export const downloadMedia: RequestHandler = async (request, response) => {
  const params = request.validatedParams as MediaIdParams;

  const result = await mediaService.createAccessUrl(params.mediaId, true);

  response.status(200).json({
    success: true,

    data: result,
  });
};

export const deleteMedia: RequestHandler = async (request, response) => {
  const actorUserId = requireAuthUserId(request);

  const params = request.validatedParams as MediaIdParams;

  const media = await mediaService.delete(actorUserId, params.mediaId);

  response.status(200).json({
    success: true,

    data: {
      media,
    },

    message: "El archivo fue eliminado correctamente.",
  });
};
