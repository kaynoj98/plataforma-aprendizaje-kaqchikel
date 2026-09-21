import type { Prisma } from "../../generated/prisma/client.js";
import { PublishStatus } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";

import type {
  CreateLessonInput,
  CreateLevelInput,
  CreateUnitInput,
  ListChildrenQuery,
  UpdateLessonInput,
  UpdateLevelInput,
  UpdateUnitInput,
} from "./learning-structure.schemas.js";

const levelSelect = {
  id: true,
  courseId: true,
  title: true,
  description: true,
  position: true,
  status: true,
  publishedAt: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

const unitSelect = {
  id: true,
  levelId: true,
  title: true,
  description: true,
  position: true,
  status: true,
  publishedAt: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

const lessonSelect = {
  id: true,
  unitId: true,
  title: true,
  slug: true,
  description: true,
  estimatedMinutes: true,
  position: true,
  status: true,
  publishedAt: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

function activeFilter(includeArchived: boolean): Prisma.CourseLevelWhereInput {
  return includeArchived
    ? {}
    : {
        deletedAt: null,
        status: {
          not: PublishStatus.ARCHIVED,
        },
      };
}

export const learningStructureRepository = {
  findAdminCourse(courseId: string) {
    return prisma.course.findFirst({
      where: {
        id: courseId,
        deletedAt: null,
      },

      select: {
        id: true,
        title: true,
        status: true,
      },
    });
  },

  findAdminLevel(levelId: string) {
    return prisma.courseLevel.findFirst({
      where: {
        id: levelId,
        deletedAt: null,
      },
      select: levelSelect,
    });
  },

  findAdminUnit(unitId: string) {
    return prisma.courseUnit.findFirst({
      where: {
        id: unitId,
        deletedAt: null,
      },
      select: unitSelect,
    });
  },

  findAdminLesson(lessonId: string) {
    return prisma.lesson.findFirst({
      where: {
        id: lessonId,
        deletedAt: null,
      },
      select: lessonSelect,
    });
  },

  listLevels(courseId: string, query: ListChildrenQuery) {
    return prisma.courseLevel.findMany({
      where: {
        courseId,
        ...activeFilter(query.includeArchived),
      },

      orderBy: [
        {
          position: "asc",
        },
        {
          createdAt: "asc",
        },
      ],

      select: levelSelect,
    });
  },

  createLevel(data: {
    courseId: string;
    actorUserId: string;
    input: CreateLevelInput;
  }) {
    return prisma.$transaction(async (transaction) => {
      const level = await transaction.courseLevel.create({
        data: {
          courseId: data.courseId,
          title: data.input.title,
          description: data.input.description ?? null,
          position: data.input.position,
        },

        select: levelSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorUserId: data.actorUserId,
          action: "COURSE_LEVEL_CREATED",
          entityType: "CourseLevel",
          entityId: level.id,
          newValues: {
            courseId: level.courseId,
            title: level.title,
            position: level.position,
          },
        },
      });

      return level;
    });
  },

  updateLevel(data: {
    levelId: string;
    actorUserId: string;
    input: UpdateLevelInput;
  }) {
    return prisma.$transaction(async (transaction) => {
      const current = await transaction.courseLevel.findFirst({
        where: {
          id: data.levelId,
          deletedAt: null,
        },
        select: levelSelect,
      });

      if (!current) {
        return null;
      }

      const updated = await transaction.courseLevel.update({
        where: {
          id: data.levelId,
        },

        data: {
          ...(data.input.title !== undefined
            ? { title: data.input.title }
            : {}),

          ...(data.input.description !== undefined
            ? { description: data.input.description }
            : {}),

          ...(data.input.position !== undefined
            ? { position: data.input.position }
            : {}),
        },

        select: levelSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorUserId: data.actorUserId,
          action: "COURSE_LEVEL_UPDATED",
          entityType: "CourseLevel",
          entityId: data.levelId,
          oldValues: {
            title: current.title,
            description: current.description,
            position: current.position,
          },
          newValues: {
            title: updated.title,
            description: updated.description,
            position: updated.position,
          },
        },
      });

      return updated;
    });
  },

  updateLevelStatus(data: {
    levelId: string;
    actorUserId: string;
    status: PublishStatus;
  }) {
    return prisma.$transaction(async (transaction) => {
      const current = await transaction.courseLevel.findFirst({
        where: {
          id: data.levelId,
          deletedAt: null,
        },
        select: levelSelect,
      });

      if (!current) {
        return null;
      }

      const now = new Date();

      const updated = await transaction.courseLevel.update({
        where: {
          id: data.levelId,
        },

        data: {
          status: data.status,
          publishedAt:
            data.status === PublishStatus.PUBLISHED
              ? (current.publishedAt ?? now)
              : current.publishedAt,
        },

        select: levelSelect,
      });

      const action =
        data.status === PublishStatus.PUBLISHED
          ? "COURSE_LEVEL_PUBLISHED"
          : data.status === PublishStatus.ARCHIVED
            ? "COURSE_LEVEL_ARCHIVED"
            : "COURSE_LEVEL_UNPUBLISHED";

      await transaction.auditLog.create({
        data: {
          actorUserId: data.actorUserId,
          action,
          entityType: "CourseLevel",
          entityId: data.levelId,
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

  softDeleteLevel(data: { levelId: string; actorUserId: string }) {
    return prisma.$transaction(async (transaction) => {
      const current = await transaction.courseLevel.findFirst({
        where: {
          id: data.levelId,
          deletedAt: null,
        },
        select: levelSelect,
      });

      if (!current) {
        return null;
      }

      const updated = await transaction.courseLevel.update({
        where: {
          id: data.levelId,
        },

        data: {
          deletedAt: new Date(),
          status: PublishStatus.ARCHIVED,
        },

        select: levelSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorUserId: data.actorUserId,
          action: "COURSE_LEVEL_DELETED",
          entityType: "CourseLevel",
          entityId: data.levelId,
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

  listUnits(levelId: string, query: ListChildrenQuery) {
    return prisma.courseUnit.findMany({
      where: {
        levelId,
        ...(query.includeArchived
          ? {}
          : {
              deletedAt: null,
              status: {
                not: PublishStatus.ARCHIVED,
              },
            }),
      },

      orderBy: [
        {
          position: "asc",
        },
        {
          createdAt: "asc",
        },
      ],

      select: unitSelect,
    });
  },

  createUnit(data: {
    levelId: string;
    actorUserId: string;
    input: CreateUnitInput;
  }) {
    return prisma.$transaction(async (transaction) => {
      const unit = await transaction.courseUnit.create({
        data: {
          levelId: data.levelId,
          title: data.input.title,
          description: data.input.description ?? null,
          position: data.input.position,
        },

        select: unitSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorUserId: data.actorUserId,
          action: "COURSE_UNIT_CREATED",
          entityType: "CourseUnit",
          entityId: unit.id,
          newValues: {
            levelId: unit.levelId,
            title: unit.title,
            position: unit.position,
          },
        },
      });

      return unit;
    });
  },

  updateUnit(data: {
    unitId: string;
    actorUserId: string;
    input: UpdateUnitInput;
  }) {
    return prisma.$transaction(async (transaction) => {
      const current = await transaction.courseUnit.findFirst({
        where: {
          id: data.unitId,
          deletedAt: null,
        },
        select: unitSelect,
      });

      if (!current) {
        return null;
      }

      const updated = await transaction.courseUnit.update({
        where: {
          id: data.unitId,
        },

        data: {
          ...(data.input.title !== undefined
            ? { title: data.input.title }
            : {}),

          ...(data.input.description !== undefined
            ? { description: data.input.description }
            : {}),

          ...(data.input.position !== undefined
            ? { position: data.input.position }
            : {}),
        },

        select: unitSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorUserId: data.actorUserId,
          action: "COURSE_UNIT_UPDATED",
          entityType: "CourseUnit",
          entityId: data.unitId,
          oldValues: {
            title: current.title,
            description: current.description,
            position: current.position,
          },
          newValues: {
            title: updated.title,
            description: updated.description,
            position: updated.position,
          },
        },
      });

      return updated;
    });
  },

  updateUnitStatus(data: {
    unitId: string;
    actorUserId: string;
    status: PublishStatus;
  }) {
    return prisma.$transaction(async (transaction) => {
      const current = await transaction.courseUnit.findFirst({
        where: {
          id: data.unitId,
          deletedAt: null,
        },
        select: unitSelect,
      });

      if (!current) {
        return null;
      }

      const now = new Date();

      const updated = await transaction.courseUnit.update({
        where: {
          id: data.unitId,
        },

        data: {
          status: data.status,
          publishedAt:
            data.status === PublishStatus.PUBLISHED
              ? (current.publishedAt ?? now)
              : current.publishedAt,
        },

        select: unitSelect,
      });

      const action =
        data.status === PublishStatus.PUBLISHED
          ? "COURSE_UNIT_PUBLISHED"
          : data.status === PublishStatus.ARCHIVED
            ? "COURSE_UNIT_ARCHIVED"
            : "COURSE_UNIT_UNPUBLISHED";

      await transaction.auditLog.create({
        data: {
          actorUserId: data.actorUserId,
          action,
          entityType: "CourseUnit",
          entityId: data.unitId,
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

  softDeleteUnit(data: { unitId: string; actorUserId: string }) {
    return prisma.$transaction(async (transaction) => {
      const current = await transaction.courseUnit.findFirst({
        where: {
          id: data.unitId,
          deletedAt: null,
        },
        select: unitSelect,
      });

      if (!current) {
        return null;
      }

      const updated = await transaction.courseUnit.update({
        where: {
          id: data.unitId,
        },

        data: {
          deletedAt: new Date(),
          status: PublishStatus.ARCHIVED,
        },

        select: unitSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorUserId: data.actorUserId,
          action: "COURSE_UNIT_DELETED",
          entityType: "CourseUnit",
          entityId: data.unitId,
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

  listLessons(unitId: string, query: ListChildrenQuery) {
    return prisma.lesson.findMany({
      where: {
        unitId,
        ...(query.includeArchived
          ? {}
          : {
              deletedAt: null,
              status: {
                not: PublishStatus.ARCHIVED,
              },
            }),
      },

      orderBy: [
        {
          position: "asc",
        },
        {
          createdAt: "asc",
        },
      ],

      select: lessonSelect,
    });
  },

  findLessonByUnitAndSlug(data: { unitId: string; slug: string }) {
    return prisma.lesson.findFirst({
      where: {
        unitId: data.unitId,
        slug: data.slug,
      },

      select: {
        id: true,
        slug: true,
      },
    });
  },

  createLesson(data: {
    unitId: string;
    actorUserId: string;
    input: CreateLessonInput;
    slug: string;
  }) {
    return prisma.$transaction(async (transaction) => {
      const lesson = await transaction.lesson.create({
        data: {
          unitId: data.unitId,
          title: data.input.title,
          slug: data.slug,
          description: data.input.description ?? null,
          estimatedMinutes: data.input.estimatedMinutes,
          position: data.input.position,
        },

        select: lessonSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorUserId: data.actorUserId,
          action: "LESSON_CREATED",
          entityType: "Lesson",
          entityId: lesson.id,
          newValues: {
            unitId: lesson.unitId,
            title: lesson.title,
            slug: lesson.slug,
            position: lesson.position,
          },
        },
      });

      return lesson;
    });
  },

  updateLesson(data: {
    lessonId: string;
    actorUserId: string;
    input: UpdateLessonInput;
    slug?: string;
  }) {
    return prisma.$transaction(async (transaction) => {
      const current = await transaction.lesson.findFirst({
        where: {
          id: data.lessonId,
          deletedAt: null,
        },
        select: lessonSelect,
      });

      if (!current) {
        return null;
      }

      const updated = await transaction.lesson.update({
        where: {
          id: data.lessonId,
        },

        data: {
          ...(data.input.title !== undefined
            ? { title: data.input.title }
            : {}),

          ...(data.slug !== undefined ? { slug: data.slug } : {}),

          ...(data.input.description !== undefined
            ? { description: data.input.description }
            : {}),

          ...(data.input.estimatedMinutes !== undefined
            ? { estimatedMinutes: data.input.estimatedMinutes }
            : {}),

          ...(data.input.position !== undefined
            ? { position: data.input.position }
            : {}),
        },

        select: lessonSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorUserId: data.actorUserId,
          action: "LESSON_UPDATED",
          entityType: "Lesson",
          entityId: data.lessonId,
          oldValues: {
            title: current.title,
            slug: current.slug,
            description: current.description,
            estimatedMinutes: current.estimatedMinutes,
            position: current.position,
          },
          newValues: {
            title: updated.title,
            slug: updated.slug,
            description: updated.description,
            estimatedMinutes: updated.estimatedMinutes,
            position: updated.position,
          },
        },
      });

      return updated;
    });
  },

  updateLessonStatus(data: {
    lessonId: string;
    actorUserId: string;
    status: PublishStatus;
  }) {
    return prisma.$transaction(async (transaction) => {
      const current = await transaction.lesson.findFirst({
        where: {
          id: data.lessonId,
          deletedAt: null,
        },
        select: lessonSelect,
      });

      if (!current) {
        return null;
      }

      const now = new Date();

      const updated = await transaction.lesson.update({
        where: {
          id: data.lessonId,
        },

        data: {
          status: data.status,
          publishedAt:
            data.status === PublishStatus.PUBLISHED
              ? (current.publishedAt ?? now)
              : current.publishedAt,
        },

        select: lessonSelect,
      });

      const action =
        data.status === PublishStatus.PUBLISHED
          ? "LESSON_PUBLISHED"
          : data.status === PublishStatus.ARCHIVED
            ? "LESSON_ARCHIVED"
            : "LESSON_UNPUBLISHED";

      await transaction.auditLog.create({
        data: {
          actorUserId: data.actorUserId,
          action,
          entityType: "Lesson",
          entityId: data.lessonId,
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

  softDeleteLesson(data: { lessonId: string; actorUserId: string }) {
    return prisma.$transaction(async (transaction) => {
      const current = await transaction.lesson.findFirst({
        where: {
          id: data.lessonId,
          deletedAt: null,
        },
        select: lessonSelect,
      });

      if (!current) {
        return null;
      }

      const updated = await transaction.lesson.update({
        where: {
          id: data.lessonId,
        },

        data: {
          deletedAt: new Date(),
          status: PublishStatus.ARCHIVED,
        },

        select: lessonSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorUserId: data.actorUserId,
          action: "LESSON_DELETED",
          entityType: "Lesson",
          entityId: data.lessonId,
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

  findPublishedCourseStructure(courseId: string) {
    return prisma.course.findFirst({
      where: {
        id: courseId,
        deletedAt: null,
        status: PublishStatus.PUBLISHED,
      },

      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        difficulty: true,
        status: true,

        levels: {
          where: {
            deletedAt: null,
            status: PublishStatus.PUBLISHED,
          },

          orderBy: {
            position: "asc",
          },

          select: {
            id: true,
            title: true,
            description: true,
            position: true,
            status: true,

            units: {
              where: {
                deletedAt: null,
                status: PublishStatus.PUBLISHED,
              },

              orderBy: {
                position: "asc",
              },

              select: {
                id: true,
                title: true,
                description: true,
                position: true,
                status: true,

                lessons: {
                  where: {
                    deletedAt: null,
                    status: PublishStatus.PUBLISHED,
                  },

                  orderBy: {
                    position: "asc",
                  },

                  select: {
                    id: true,
                    title: true,
                    slug: true,
                    description: true,
                    estimatedMinutes: true,
                    position: true,
                    status: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  },

  findPublishedLessonById(lessonId: string) {
    return prisma.lesson.findFirst({
      where: {
        id: lessonId,
        deletedAt: null,
        status: PublishStatus.PUBLISHED,
        unit: {
          deletedAt: null,
          status: PublishStatus.PUBLISHED,
          level: {
            deletedAt: null,
            status: PublishStatus.PUBLISHED,
            course: {
              deletedAt: null,
              status: PublishStatus.PUBLISHED,
            },
          },
        },
      },

      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        estimatedMinutes: true,
        position: true,
        status: true,

        unit: {
          select: {
            id: true,
            title: true,

            level: {
              select: {
                id: true,
                title: true,

                course: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  },
};
