import type { Prisma } from "../../generated/prisma/client.js";

import { MediaStatus } from "../../generated/prisma/client.js";

import { prisma } from "../../lib/prisma.js";

import type { ListMediaQuery } from "./media.schemas.js";

const mediaSelect = {
  id: true,
  uploadedById: true,
  originalName: true,
  objectKey: true,
  bucket: true,
  mediaType: true,
  mimeType: true,
  sizeBytes: true,
  status: true,
  metadata: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,

  uploadedBy: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
} as const;

export const mediaRepository = {
  create(data: {
    uploadedById: string;
    originalName: string;
    objectKey: string;
    bucket: string;
    mediaType: "IMAGE" | "AUDIO" | "VIDEO" | "DOCUMENT";
    mimeType: string;
    sizeBytes: number;
  }) {
    return prisma.$transaction(async (transaction) => {
      const media = await transaction.mediaFile.create({
        data: {
          uploadedById: data.uploadedById,

          originalName: data.originalName,

          objectKey: data.objectKey,

          bucket: data.bucket,

          mediaType: data.mediaType,

          mimeType: data.mimeType,

          sizeBytes: data.sizeBytes,

          status: MediaStatus.AVAILABLE,
        },

        select: mediaSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorUserId: data.uploadedById,

          action: "MEDIA_UPLOADED",

          entityType: "MediaFile",

          entityId: media.id,

          newValues: {
            originalName: media.originalName,

            mediaType: media.mediaType,

            mimeType: media.mimeType,

            sizeBytes: media.sizeBytes,

            objectKey: media.objectKey,
          },
        },
      });

      return media;
    });
  },

  findById(mediaId: string) {
    return prisma.mediaFile.findFirst({
      where: {
        id: mediaId,
        deletedAt: null,
        status: MediaStatus.AVAILABLE,
      },

      select: mediaSelect,
    });
  },

  findAdminById(mediaId: string) {
    return prisma.mediaFile.findFirst({
      where: {
        id: mediaId,
        deletedAt: null,
      },

      select: mediaSelect,
    });
  },

  async list(query: ListMediaQuery) {
    const where: Prisma.MediaFileWhereInput = {
      deletedAt: null,

      ...(query.type
        ? {
            mediaType: query.type,
          }
        : {}),

      ...(query.status
        ? {
            status: query.status,
          }
        : {}),

      ...(query.search
        ? {
            originalName: {
              contains: query.search,

              mode: "insensitive",
            },
          }
        : {}),
    };

    const skip = (query.page - 1) * query.pageSize;

    const [totalItems, media] = await prisma.$transaction([
      prisma.mediaFile.count({
        where,
      }),

      prisma.mediaFile.findMany({
        where,

        skip,

        take: query.pageSize,

        orderBy: {
          createdAt: query.sortOrder,
        },

        select: mediaSelect,
      }),
    ]);

    return {
      totalItems,
      media,
    };
  },

  softDelete(data: { mediaId: string; actorUserId: string }) {
    return prisma.$transaction(async (transaction) => {
      const current = await transaction.mediaFile.findFirst({
        where: {
          id: data.mediaId,

          deletedAt: null,
        },

        select: mediaSelect,
      });

      if (!current) {
        return null;
      }

      const updated = await transaction.mediaFile.update({
        where: {
          id: data.mediaId,
        },

        data: {
          status: MediaStatus.DELETED,

          deletedAt: new Date(),
        },

        select: mediaSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorUserId: data.actorUserId,

          action: "MEDIA_DELETED",

          entityType: "MediaFile",

          entityId: data.mediaId,

          oldValues: {
            status: current.status,

            deletedAt: current.deletedAt,
          },

          newValues: {
            status: updated.status,

            deletedAt: updated.deletedAt,
          },
        },
      });

      return updated;
    });
  },
};
