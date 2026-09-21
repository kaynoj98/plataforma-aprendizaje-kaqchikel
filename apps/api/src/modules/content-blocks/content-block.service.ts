import { AppError } from "../../errors/app-error.js";

import { contentBlockRepository } from "./content-block.repository.js";
import type {
  CreateContentBlockInput,
  ReorderContentBlocksInput,
  UpdateContentBlockInput,
} from "./content-block.schemas.js";

export const contentBlockService = {
  async listByLesson(lessonId: string) {
    const lesson = await contentBlockRepository.findLesson(lessonId);

    if (!lesson) {
      throw new AppError(404, "LESSON_NOT_FOUND", "La lección no existe.");
    }

    return contentBlockRepository.listByLesson(lessonId);
  },

  async getById(blockId: string) {
    const block = await contentBlockRepository.findById(blockId);

    if (!block) {
      throw new AppError(
        404,
        "CONTENT_BLOCK_NOT_FOUND",
        "El bloque de contenido no existe.",
      );
    }

    return block;
  },

  async create(
    actorUserId: string,
    lessonId: string,
    input: CreateContentBlockInput,
  ) {
    const lesson = await contentBlockRepository.findLesson(lessonId);

    if (!lesson) {
      throw new AppError(404, "LESSON_NOT_FOUND", "La lección no existe.");
    }

    return contentBlockRepository.create({
      actorUserId,
      lessonId,
      input,
    });
  },

  async update(
    actorUserId: string,
    blockId: string,
    input: UpdateContentBlockInput,
  ) {
    const block = await contentBlockRepository.update({
      actorUserId,
      blockId,
      input,
    });

    if (!block) {
      throw new AppError(
        404,
        "CONTENT_BLOCK_NOT_FOUND",
        "El bloque de contenido no existe.",
      );
    }

    return block;
  },

  async delete(actorUserId: string, blockId: string) {
    const block = await contentBlockRepository.softDelete({
      actorUserId,
      blockId,
    });

    if (!block) {
      throw new AppError(
        404,
        "CONTENT_BLOCK_NOT_FOUND",
        "El bloque de contenido no existe.",
      );
    }

    return block;
  },

  async reorder(
    actorUserId: string,
    lessonId: string,
    input: ReorderContentBlocksInput,
  ) {
    const lesson = await contentBlockRepository.findLesson(lessonId);

    if (!lesson) {
      throw new AppError(404, "LESSON_NOT_FOUND", "La lección no existe.");
    }

    const result = await contentBlockRepository.reorder({
      actorUserId,
      lessonId,
      input,
    });

    if (result.status === "INVALID_BLOCKS") {
      throw new AppError(
        400,
        "INVALID_CONTENT_BLOCKS",
        "Uno o más bloques no pertenecen a esta lección.",
      );
    }

    return result.blocks;
  },
};
