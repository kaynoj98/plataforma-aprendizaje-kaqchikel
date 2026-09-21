import type { RequestHandler } from "express";

import { AppError } from "../../errors/app-error.js";

import { contentBlockService } from "./content-block.service.js";
import type {
  BlockIdParams,
  CreateContentBlockInput,
  LessonIdParams,
  ReorderContentBlocksInput,
  UpdateContentBlockInput,
} from "./content-block.schemas.js";

function requireAuthUserId(request: Parameters<RequestHandler>[0]): string {
  if (!request.auth) {
    throw new AppError(401, "AUTHENTICATION_REQUIRED", "Debes iniciar sesión.");
  }

  return request.auth.user.id;
}

export const listContentBlocks: RequestHandler = async (request, response) => {
  const params = request.validatedParams as LessonIdParams;

  const blocks = await contentBlockService.listByLesson(params.lessonId);

  response.status(200).json({
    success: true,
    data: {
      blocks,
    },
  });
};

export const getContentBlock: RequestHandler = async (request, response) => {
  const params = request.validatedParams as BlockIdParams;

  const block = await contentBlockService.getById(params.blockId);

  response.status(200).json({
    success: true,
    data: {
      block,
    },
  });
};

export const createContentBlock: RequestHandler = async (request, response) => {
  const actorUserId = requireAuthUserId(request);

  const params = request.validatedParams as LessonIdParams;

  const input = request.body as CreateContentBlockInput;

  const block = await contentBlockService.create(
    actorUserId,
    params.lessonId,
    input,
  );

  response.status(201).json({
    success: true,
    data: {
      block,
    },
    message: "El bloque de contenido fue creado correctamente.",
  });
};

export const updateContentBlock: RequestHandler = async (request, response) => {
  const actorUserId = requireAuthUserId(request);

  const params = request.validatedParams as BlockIdParams;

  const input = request.body as UpdateContentBlockInput;

  const block = await contentBlockService.update(
    actorUserId,
    params.blockId,
    input,
  );

  response.status(200).json({
    success: true,
    data: {
      block,
    },
    message: "El bloque de contenido fue actualizado correctamente.",
  });
};

export const deleteContentBlock: RequestHandler = async (request, response) => {
  const actorUserId = requireAuthUserId(request);

  const params = request.validatedParams as BlockIdParams;

  const block = await contentBlockService.delete(actorUserId, params.blockId);

  response.status(200).json({
    success: true,
    data: {
      block,
    },
    message: "El bloque de contenido fue eliminado correctamente.",
  });
};

export const reorderContentBlocks: RequestHandler = async (
  request,
  response,
) => {
  const actorUserId = requireAuthUserId(request);

  const params = request.validatedParams as LessonIdParams;

  const input = request.body as ReorderContentBlocksInput;

  const blocks = await contentBlockService.reorder(
    actorUserId,
    params.lessonId,
    input,
  );

  response.status(200).json({
    success: true,
    data: {
      blocks,
    },
    message: "Los bloques fueron reordenados correctamente.",
  });
};
