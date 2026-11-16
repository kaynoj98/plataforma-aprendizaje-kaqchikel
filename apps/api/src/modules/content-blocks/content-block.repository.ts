import { createHash } from "node:crypto";
import { AppError } from "../../errors/app-error.js";
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
  mediaId: true,
  position: true,
  isVisible: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export function lessonRevision(lessonId: string, blocks: { id: string; updatedAt: Date }[]) {
  const versions = blocks.map(block => block.id + ":" + block.updatedAt.toISOString()).sort();
  return createHash("sha256").update([lessonId, ...versions].join("|")).digest("hex");
}

// Serializa las escrituras por lección. Los clientes previos pueden omitir la revisión.
async function lockLesson(tx: Prisma.TransactionClient, lessonId: string, revision?: string) {
  const rows = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM lessons WHERE id = ${lessonId}::uuid AND deleted_at IS NULL FOR UPDATE`;
  if (!rows.length) throw new AppError(404, "LESSON_NOT_FOUND", "La lección no está disponible.");
  if (revision !== undefined) {
    const blocks = await tx.lessonContentBlock.findMany({
      where: { lessonId, deletedAt: null }, select: { id: true, updatedAt: true },
    });
    if (revision !== lessonRevision(lessonId, blocks)) {
      throw new AppError(409, "BLOCKS_CHANGED", "La lista cambió. Revisa la versión actual antes de guardar.");
    }
  }
}

async function validateMedia(tx: Prisma.TransactionClient, type: ContentBlockType, mediaId: string | null,
  content: unknown) {
  if (type !== "IMAGE" && type !== "AUDIO" && type !== "VIDEO") {
    if (mediaId) throw new AppError(400, "INVALID_MEDIA", "Este tipo de bloque no admite un archivo.");
    return;
  }
  if (!mediaId) throw new AppError(400, "MEDIA_REQUIRED", "Selecciona un archivo para el bloque.");
  const metadata = content && typeof content === "object" ? content as Record<string, unknown> : {};
  if (type === "IMAGE" && (typeof metadata.alt !== "string" || !metadata.alt.trim())) {
    throw new AppError(400, "ALT_REQUIRED", "La imagen requiere texto alternativo.");
  }
  for (const key of ["alt", "description", "transcript"]) {
    const item = metadata[key];
    if (item !== undefined && (typeof item !== "string" || item.length > (key === "alt" ? 500 : 10000)))
      throw new AppError(400, "INVALID_MEDIA_TEXT", "Revisa los textos del archivo.");
  }
  await tx.$queryRaw`SELECT id FROM media_files WHERE id = ${mediaId}::uuid FOR SHARE`;
  const media = await tx.mediaFile.findFirst({where:{id:mediaId, mediaType:type, status:"AVAILABLE", deletedAt:null},
    select:{id:true}});
  if (!media) throw new AppError(400, "INVALID_MEDIA", "El archivo no está disponible o es de otro tipo.");
}

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
    revision?: string;
  }) {
    return prisma.$transaction(async (transaction) => {
      await lockLesson(transaction, data.lessonId, data.revision);
      await validateMedia(transaction, data.input.type, data.input.mediaId ?? null, data.input.content);
      const block = await transaction.lessonContentBlock.create({
        data: {
          lessonId: data.lessonId,

          type: ContentBlockType[data.input.type],
          mediaId: data.input.mediaId,

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
    revision?: string;
  }) {
    return prisma.$transaction(async (transaction) => {
      const parent = await transaction.lessonContentBlock.findUnique({ where: { id: data.blockId }, select: { lessonId: true } });
      if (!parent) return null;
      await lockLesson(transaction, parent.lessonId, data.revision);
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

      if (data.input.mediaId !== undefined || data.input.type !== undefined || data.input.content !== undefined) {
        await validateMedia(transaction, data.input.type ?? current.type,
          data.input.mediaId === undefined ? current.mediaId : data.input.mediaId,
          data.input.content ?? current.content);
      }
      const updated = await transaction.lessonContentBlock.update({
        where: {
          id: data.blockId,
        },

        data: {
          mediaId: data.input.mediaId,
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

  softDelete(data: { blockId: string; actorUserId: string; revision?: string }) {
    return prisma.$transaction(async (transaction) => {
      const parent = await transaction.lessonContentBlock.findUnique({ where: { id: data.blockId }, select: { lessonId: true } });
      if (!parent) return null;
      await lockLesson(transaction, parent.lessonId, data.revision);
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
    revision?: string;
  }) {
    return prisma.$transaction(async (transaction) => {
      await lockLesson(transaction, data.lessonId, data.revision);
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
