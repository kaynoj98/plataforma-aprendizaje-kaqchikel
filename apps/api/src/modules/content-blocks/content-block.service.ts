import { AppError } from "../../errors/app-error.js";

import { contentBlockRepository } from "./content-block.repository.js";
import type {
  CreateContentBlockInput,
  ReorderContentBlocksInput,
  UpdateContentBlockInput,
} from "./content-block.schemas.js";

function requireEditable(blockId: string) {
  if (blockId.toLowerCase() === "3f07bcd1-d22a-49a1-a3f6-bafcb24ca70e")
    throw new AppError(409, "HISTORICAL_BLOCK", "El ejemplo histórico es de solo lectura.");
}

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
    revision?: string,
  ) {
    const lesson = await contentBlockRepository.findLesson(lessonId);

    if (!lesson) {
      throw new AppError(404, "LESSON_NOT_FOUND", "La lección no existe.");
    }

    return contentBlockRepository.create({
      actorUserId,
      lessonId,
      input,
      revision,
    });
  },

  async update(
    actorUserId: string,
    blockId: string,
    input: UpdateContentBlockInput,
    revision?: string,
  ) {
    requireEditable(blockId);
    const block = await contentBlockRepository.update({
      actorUserId,
      blockId,
      input,
      revision,
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

  async delete(actorUserId: string, blockId: string, revision?: string) {
    requireEditable(blockId);
    const block = await contentBlockRepository.softDelete({
      revision,
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
    revision?: string,
  ) {
    const lesson = await contentBlockRepository.findLesson(lessonId);

    if (!lesson) {
      throw new AppError(404, "LESSON_NOT_FOUND", "La lección no existe.");
    }

    for (const block of input.blocks) requireEditable(block.blockId);
    const result = await contentBlockRepository.reorder({
      actorUserId,
      lessonId,
      input,
      revision,
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
