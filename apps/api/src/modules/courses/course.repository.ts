import type { Prisma } from "../../generated/prisma/client.js";
import {
  CourseDifficulty,
  PublishStatus,
} from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";

import type {
  AdminListCoursesQuery,
  CreateCourseInput,
  PublicListCoursesQuery,
  UpdateCourseInput,
} from "./course.schemas.js";

const courseSelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  objectives: true,
  difficulty: true,
  status: true,
  position: true,
  isPublicPreview: true,
  createdById: true,
  publishedAt: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,

  createdBy: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
} as const;

function buildAdminWhere(
  query: AdminListCoursesQuery,
): Prisma.CourseWhereInput {
  const where: Prisma.CourseWhereInput = {
    deletedAt: null,
  };

  if (query.status) {
    where.status = query.status;
  }

  if (query.difficulty) {
    where.difficulty = query.difficulty;
  }

  if (query.search) {
    where.OR = [
      {
        title: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        slug: {
          contains: query.search,
          mode: "insensitive",
        },
      },
    ];
  }

  return where;
}

function buildPublicWhere(
  query: PublicListCoursesQuery,
): Prisma.CourseWhereInput {
  const where: Prisma.CourseWhereInput = {
    deletedAt: null,
    status: PublishStatus.PUBLISHED,
  };

  if (query.difficulty) {
    where.difficulty = query.difficulty;
  }

  if (query.search) {
    where.OR = [
      {
        title: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: query.search,
          mode: "insensitive",
        },
      },
    ];
  }

  return where;
}

export const courseRepository = {
  async listAdmin(query: AdminListCoursesQuery) {
    const where = buildAdminWhere(query);

    const skip = (query.page - 1) * query.pageSize;

    const take = query.pageSize;

    const orderBy = {
      [query.sortBy]: query.sortOrder,
    } as Prisma.CourseOrderByWithRelationInput;

    const [totalItems, courses] = await prisma.$transaction([
      prisma.course.count({
        where,
      }),

      prisma.course.findMany({
        where,
        orderBy,
        skip,
        take,
        select: courseSelect,
      }),
    ]);

    return {
      totalItems,
      courses,
    };
  },

  async listPublished(query: PublicListCoursesQuery) {
    const where = buildPublicWhere(query);

    const skip = (query.page - 1) * query.pageSize;

    const take = query.pageSize;

    const orderBy = {
      [query.sortBy]: query.sortOrder,
    } as Prisma.CourseOrderByWithRelationInput;

    const [totalItems, courses] = await prisma.$transaction([
      prisma.course.count({
        where,
      }),

      prisma.course.findMany({
        where,
        orderBy,
        skip,
        take,
        select: courseSelect,
      }),
    ]);

    return {
      totalItems,
      courses,
    };
  },

  findAdminById(courseId: string) {
    return prisma.course.findFirst({
      where: {
        id: courseId,
        deletedAt: null,
      },
      select: courseSelect,
    });
  },

  findPublishedById(courseId: string) {
    return prisma.course.findFirst({
      where: {
        id: courseId,
        deletedAt: null,
        status: PublishStatus.PUBLISHED,
      },
      select: courseSelect,
    });
  },

  findPublicPreviewBySlug(slug: string) {
    return prisma.course.findFirst({
      where: {
        slug,
        deletedAt: null,
        status: PublishStatus.PUBLISHED,
        isPublicPreview: true,
      },
      select: courseSelect,
    });
  },

  findBySlug(slug: string) {
    return prisma.course.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
        slug: true,
      },
    });
  },

  create(data: {
    input: CreateCourseInput;
    slug: string;
    createdById: string;
  }) {
    return prisma.$transaction(async (transaction) => {
      const course = await transaction.course.create({
        data: {
          title: data.input.title,
          slug: data.slug,
          description: data.input.description,
          objectives: data.input.objectives ?? null,
          difficulty: CourseDifficulty[data.input.difficulty],
          position: data.input.position,
          isPublicPreview: data.input.isPublicPreview,
          createdById: data.createdById,
        },

        select: courseSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorUserId: data.createdById,
          action: "COURSE_CREATED",
          entityType: "Course",
          entityId: course.id,
          newValues: {
            title: course.title,
            slug: course.slug,
            difficulty: course.difficulty,
            status: course.status,
          },
        },
      });

      return course;
    });
  },

  update(data: {
    courseId: string;
    actorUserId: string;
    input: UpdateCourseInput;
    slug?: string;
  }) {
    return prisma.$transaction(async (transaction) => {
      const current = await transaction.course.findFirst({
        where: {
          id: data.courseId,
          deletedAt: null,
        },
        select: courseSelect,
      });

      if (!current) {
        return null;
      }

      const updateData: Prisma.CourseUpdateInput = {
        ...(data.input.title !== undefined ? { title: data.input.title } : {}),

        ...(data.slug !== undefined ? { slug: data.slug } : {}),

        ...(data.input.description !== undefined
          ? {
              description: data.input.description,
            }
          : {}),

        ...(data.input.objectives !== undefined
          ? {
              objectives: data.input.objectives,
            }
          : {}),

        ...(data.input.difficulty !== undefined
          ? {
              difficulty: CourseDifficulty[data.input.difficulty],
            }
          : {}),

        ...(data.input.position !== undefined
          ? {
              position: data.input.position,
            }
          : {}),

        ...(data.input.isPublicPreview !== undefined
          ? {
              isPublicPreview: data.input.isPublicPreview,
            }
          : {}),
      };

      const updated = await transaction.course.update({
        where: {
          id: data.courseId,
        },
        data: updateData,
        select: courseSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorUserId: data.actorUserId,
          action: "COURSE_UPDATED",
          entityType: "Course",
          entityId: data.courseId,
          oldValues: {
            title: current.title,
            slug: current.slug,
            description: current.description,
            objectives: current.objectives,
            difficulty: current.difficulty,
            position: current.position,
            isPublicPreview: current.isPublicPreview,
          },
          newValues: {
            title: updated.title,
            slug: updated.slug,
            description: updated.description,
            objectives: updated.objectives,
            difficulty: updated.difficulty,
            position: updated.position,
            isPublicPreview: updated.isPublicPreview,
          },
        },
      });

      return updated;
    });
  },

  updateStatus(data: {
    courseId: string;
    actorUserId: string;
    status: PublishStatus;
  }) {
    return prisma.$transaction(async (transaction) => {
      const current = await transaction.course.findFirst({
        where: {
          id: data.courseId,
          deletedAt: null,
        },
        select: courseSelect,
      });

      if (!current) {
        return null;
      }

      const now = new Date();

      const updated = await transaction.course.update({
        where: {
          id: data.courseId,
        },

        data: {
          status: data.status,

          publishedAt:
            data.status === PublishStatus.PUBLISHED
              ? (current.publishedAt ?? now)
              : current.publishedAt,
        },

        select: courseSelect,
      });

      const action =
        data.status === PublishStatus.PUBLISHED
          ? "COURSE_PUBLISHED"
          : data.status === PublishStatus.ARCHIVED
            ? "COURSE_ARCHIVED"
            : "COURSE_UNPUBLISHED";

      await transaction.auditLog.create({
        data: {
          actorUserId: data.actorUserId,
          action,
          entityType: "Course",
          entityId: data.courseId,
          oldValues: {
            status: current.status,
            publishedAt: current.publishedAt,
          },
          newValues: {
            status: updated.status,
            publishedAt: updated.publishedAt,
          },
        },
      });

      return updated;
    });
  },

  softDelete(data: { courseId: string; actorUserId: string }) {
    return prisma.$transaction(async (transaction) => {
      const current = await transaction.course.findFirst({
        where: {
          id: data.courseId,
          deletedAt: null,
        },
        select: courseSelect,
      });

      if (!current) {
        return null;
      }

      const now = new Date();

      const updated = await transaction.course.update({
        where: {
          id: data.courseId,
        },

        data: {
          deletedAt: now,
          status: PublishStatus.ARCHIVED,
        },

        select: courseSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorUserId: data.actorUserId,
          action: "COURSE_DELETED",
          entityType: "Course",
          entityId: data.courseId,
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
