import type { Prisma } from "../../generated/prisma/client.js";
import { ContentBlockType } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";

import type {
  CreateContentBlockInput,
  ReorderContentBlocksInput,
  UpdateContentBlockInput,
} from "./content-block.schemas.js";

const blockSelect = {
  id: true,
  lessonId: true,
  type: true,
  title: true,
  content: true,
  position: true,
  isVisible: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const contentBlockRepository = {
  findLesson(lessonId: string) {
    return prisma.lesson.findFirst({
      where: {
        id: lessonId,
        deletedAt: null,
      },

      select: {
        id: true,
        title: true,
        status: true,
      },
    });
  },

  listByLesson(lessonId: string) {
    return prisma.lessonContentBlock.findMany({
      where: {
        lessonId,
        deletedAt: null,
      },

      orderBy: [
        {
          position: "asc",
        },
        {
          createdAt: "asc",
        },
      ],

      select: blockSelect,
    });
  },

  findById(blockId: string) {
    return prisma.lessonContentBlock.findFirst({
      where: {
        id: blockId,
        deletedAt: null,
      },

      select: blockSelect,
    });
  },

  create(data: {
    lessonId: string;
    actorUserId: string;
    input: CreateContentBlockInput;
  }) {
    return prisma.$transaction(async (transaction) => {
      const block = await transaction.lessonContentBlock.create({
        data: {
          lessonId: data.lessonId,

          type: ContentBlockType[data.input.type],

          title: data.input.title ?? null,

          content: data.input.content as Prisma.InputJsonValue,

          position: data.input.position,

          isVisible: data.input.isVisible,
        },

        select: blockSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorUserId: data.actorUserId,

          action: "LESSON_CONTENT_BLOCK_CREATED",

          entityType: "LessonContentBlock",

          entityId: block.id,

          newValues: {
            lessonId: block.lessonId,
            type: block.type,
            position: block.position,
            isVisible: block.isVisible,
          },
        },
      });

      return block;
    });
  },

  update(data: {
    blockId: string;
    actorUserId: string;
    input: UpdateContentBlockInput;
  }) {
    return prisma.$transaction(async (transaction) => {
      const current = await transaction.lessonContentBlock.findFirst({
        where: {
          id: data.blockId,
          deletedAt: null,
        },

        select: blockSelect,
      });

      if (!current) {
        return null;
      }

      const updated = await transaction.lessonContentBlock.update({
        where: {
          id: data.blockId,
        },

        data: {
          ...(data.input.type !== undefined
            ? {
                type: ContentBlockType[data.input.type],
              }
            : {}),

          ...(data.input.title !== undefined
            ? {
                title: data.input.title,
              }
            : {}),

          ...(data.input.content !== undefined
            ? {
                content: data.input.content as Prisma.InputJsonValue,
              }
            : {}),

          ...(data.input.position !== undefined
            ? {
                position: data.input.position,
              }
            : {}),

          ...(data.input.isVisible !== undefined
            ? {
                isVisible: data.input.isVisible,
              }
            : {}),
        },

        select: blockSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorUserId: data.actorUserId,

          action: "LESSON_CONTENT_BLOCK_UPDATED",

          entityType: "LessonContentBlock",

          entityId: data.blockId,

          oldValues: {
            type: current.type,
            title: current.title,
            content: current.content,
            position: current.position,
            isVisible: current.isVisible,
          },

          newValues: {
            type: updated.type,
            title: updated.title,
            content: updated.content,
            position: updated.position,
            isVisible: updated.isVisible,
          },
        },
      });

      return updated;
    });
  },

  softDelete(data: { blockId: string; actorUserId: string }) {
    return prisma.$transaction(async (transaction) => {
      const current = await transaction.lessonContentBlock.findFirst({
        where: {
          id: data.blockId,
          deletedAt: null,
        },

        select: blockSelect,
      });

      if (!current) {
        return null;
      }

      const updated = await transaction.lessonContentBlock.update({
        where: {
          id: data.blockId,
        },

        data: {
          deletedAt: new Date(),

          isVisible: false,
        },

        select: blockSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorUserId: data.actorUserId,

          action: "LESSON_CONTENT_BLOCK_DELETED",

          entityType: "LessonContentBlock",

          entityId: data.blockId,

          oldValues: {
            deletedAt: current.deletedAt,
            isVisible: current.isVisible,
          },

          newValues: {
            deletedAt: updated.deletedAt,
            isVisible: updated.isVisible,
          },
        },
      });

      return updated;
    });
  },

  async reorder(data: {
    lessonId: string;
    actorUserId: string;
    input: ReorderContentBlocksInput;
  }) {
    return prisma.$transaction(async (transaction) => {
      const blockIds = data.input.blocks.map((item) => item.blockId);

      const existing = await transaction.lessonContentBlock.findMany({
        where: {
          id: {
            in: blockIds,
          },

          lessonId: data.lessonId,

          deletedAt: null,
        },

        select: {
          id: true,
        },
      });

      if (existing.length !== blockIds.length) {
        return {
          status: "INVALID_BLOCKS",
        } as const;
      }

      for (const item of data.input.blocks) {
        await transaction.lessonContentBlock.update({
          where: {
            id: item.blockId,
          },

          data: {
            position: item.position,
          },
        });
      }

      await transaction.auditLog.create({
        data: {
          actorUserId: data.actorUserId,

          action: "LESSON_CONTENT_BLOCKS_REORDERED",

          entityType: "Lesson",

          entityId: data.lessonId,

          newValues: {
            blocks: data.input.blocks,
          },
        },
      });

      const blocks = await transaction.lessonContentBlock.findMany({
        where: {
          lessonId: data.lessonId,

          deletedAt: null,
        },

        orderBy: {
          position: "asc",
        },

        select: blockSelect,
      });

      return {
        status: "SUCCESS",
        blocks,
      } as const;
    });
  },
};
