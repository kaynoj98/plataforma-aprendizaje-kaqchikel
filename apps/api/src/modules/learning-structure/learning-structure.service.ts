import { AppError } from "../../errors/app-error.js";
import { PublishStatus } from "../../generated/prisma/client.js";
import { createSlug } from "../../utils/slug.js";

import { learningStructureRepository } from "./learning-structure.repository.js";
import type {
  CreateLessonInput,
  CreateLevelInput,
  CreateUnitInput,
  ListChildrenQuery,
  UpdateLessonInput,
  UpdateLevelInput,
  UpdateUnitInput,
} from "./learning-structure.schemas.js";

function normalizeLessonSlug(title: string, requestedSlug?: string): string {
  const slug = createSlug(requestedSlug ?? title);

  if (!slug) {
    throw new AppError(
      400,
      "INVALID_LESSON_SLUG",
      "No fue posible generar un slug válido para la lección.",
    );
  }

  return slug;
}

async function ensureLessonSlugAvailable(data: {
  unitId: string;
  slug: string;
  currentLessonId?: string;
}): Promise<void> {
  const existing = await learningStructureRepository.findLessonByUnitAndSlug({
    unitId: data.unitId,
    slug: data.slug,
  });

  if (existing && existing.id !== data.currentLessonId) {
    throw new AppError(
      409,
      "LESSON_SLUG_ALREADY_EXISTS",
      "Ya existe una lección con ese slug dentro de la unidad.",
    );
  }
}

export const learningStructureService = {
  async listLevels(courseId: string, query: ListChildrenQuery) {
    const course = await learningStructureRepository.findAdminCourse(courseId);

    if (!course) {
      throw new AppError(404, "COURSE_NOT_FOUND", "El curso no existe.");
    }

    return learningStructureRepository.listLevels(courseId, query);
  },

  async createLevel(
    actorUserId: string,
    courseId: string,
    input: CreateLevelInput,
  ) {
    const course = await learningStructureRepository.findAdminCourse(courseId);

    if (!course) {
      throw new AppError(404, "COURSE_NOT_FOUND", "El curso no existe.");
    }

    return learningStructureRepository.createLevel({
      actorUserId,
      courseId,
      input,
    });
  },

  async updateLevel(
    actorUserId: string,
    levelId: string,
    input: UpdateLevelInput,
  ) {
    const level = await learningStructureRepository.updateLevel({
      actorUserId,
      levelId,
      input,
    });

    if (!level) {
      throw new AppError(404, "LEVEL_NOT_FOUND", "El nivel no existe.");
    }

    return level;
  },

  async deleteLevel(actorUserId: string, levelId: string) {
    const level = await learningStructureRepository.softDeleteLevel({
      actorUserId,
      levelId,
    });

    if (!level) {
      throw new AppError(404, "LEVEL_NOT_FOUND", "El nivel no existe.");
    }

    return level;
  },

  async listUnits(levelId: string, query: ListChildrenQuery) {
    const level = await learningStructureRepository.findAdminLevel(levelId);

    if (!level) {
      throw new AppError(404, "LEVEL_NOT_FOUND", "El nivel no existe.");
    }

    return learningStructureRepository.listUnits(levelId, query);
  },

  async createUnit(
    actorUserId: string,
    levelId: string,
    input: CreateUnitInput,
  ) {
    const level = await learningStructureRepository.findAdminLevel(levelId);

    if (!level) {
      throw new AppError(404, "LEVEL_NOT_FOUND", "El nivel no existe.");
    }

    return learningStructureRepository.createUnit({
      actorUserId,
      levelId,
      input,
    });
  },

  async updateUnit(
    actorUserId: string,
    unitId: string,
    input: UpdateUnitInput,
  ) {
    const unit = await learningStructureRepository.updateUnit({
      actorUserId,
      unitId,
      input,
    });

    if (!unit) {
      throw new AppError(404, "UNIT_NOT_FOUND", "La unidad no existe.");
    }

    return unit;
  },

  async deleteUnit(actorUserId: string, unitId: string) {
    const unit = await learningStructureRepository.softDeleteUnit({
      actorUserId,
      unitId,
    });

    if (!unit) {
      throw new AppError(404, "UNIT_NOT_FOUND", "La unidad no existe.");
    }

    return unit;
  },

  async listLessons(unitId: string, query: ListChildrenQuery) {
    const unit = await learningStructureRepository.findAdminUnit(unitId);

    if (!unit) {
      throw new AppError(404, "UNIT_NOT_FOUND", "La unidad no existe.");
    }

    return learningStructureRepository.listLessons(unitId, query);
  },

  async createLesson(
    actorUserId: string,
    unitId: string,
    input: CreateLessonInput,
  ) {
    const unit = await learningStructureRepository.findAdminUnit(unitId);

    if (!unit) {
      throw new AppError(404, "UNIT_NOT_FOUND", "La unidad no existe.");
    }

    const slug = normalizeLessonSlug(input.title, input.slug);

    await ensureLessonSlugAvailable({
      unitId,
      slug,
    });

    return learningStructureRepository.createLesson({
      actorUserId,
      unitId,
      input,
      slug,
    });
  },

  async getAdminLesson(lessonId: string) {
    const lesson = await learningStructureRepository.findAdminLesson(lessonId);

    if (!lesson) {
      throw new AppError(404, "LESSON_NOT_FOUND", "La lección no existe.");
    }

    return lesson;
  },

  async updateLesson(
    actorUserId: string,
    lessonId: string,
    input: UpdateLessonInput,
  ) {
    const current = await learningStructureRepository.findAdminLesson(lessonId);

    if (!current) {
      throw new AppError(404, "LESSON_NOT_FOUND", "La lección no existe.");
    }

    const slug =
      input.slug !== undefined
        ? normalizeLessonSlug(input.title ?? current.title, input.slug)
        : input.title !== undefined
          ? normalizeLessonSlug(input.title)
          : undefined;

    if (slug) {
      await ensureLessonSlugAvailable({
        unitId: current.unitId,
        slug,
        currentLessonId: lessonId,
      });
    }

    const lesson = await learningStructureRepository.updateLesson({
      actorUserId,
      lessonId,
      input,
      slug,
    });

    if (!lesson) {
      throw new AppError(404, "LESSON_NOT_FOUND", "La lección no existe.");
    }

    return lesson;
  },

  async publishLesson(actorUserId: string, lessonId: string) {
    const lesson = await learningStructureRepository.updateLessonStatus({
      actorUserId,
      lessonId,
      status: PublishStatus.PUBLISHED,
    });

    if (!lesson) {
      throw new AppError(404, "LESSON_NOT_FOUND", "La lección no existe.");
    }

    return lesson;
  },

  async unpublishLesson(actorUserId: string, lessonId: string) {
    const lesson = await learningStructureRepository.updateLessonStatus({
      actorUserId,
      lessonId,
      status: PublishStatus.DRAFT,
    });

    if (!lesson) {
      throw new AppError(404, "LESSON_NOT_FOUND", "La lección no existe.");
    }

    return lesson;
  },

  async archiveLesson(actorUserId: string, lessonId: string) {
    const lesson = await learningStructureRepository.updateLessonStatus({
      actorUserId,
      lessonId,
      status: PublishStatus.ARCHIVED,
    });

    if (!lesson) {
      throw new AppError(404, "LESSON_NOT_FOUND", "La lección no existe.");
    }

    return lesson;
  },

  async deleteLesson(actorUserId: string, lessonId: string) {
    const lesson = await learningStructureRepository.softDeleteLesson({
      actorUserId,
      lessonId,
    });

    if (!lesson) {
      throw new AppError(404, "LESSON_NOT_FOUND", "La lección no existe.");
    }

    return lesson;
  },

  async getPublishedStructure(courseId: string) {
    const course =
      await learningStructureRepository.findPublishedCourseStructure(courseId);

    if (!course) {
      throw new AppError(
        404,
        "COURSE_NOT_FOUND",
        "El curso no existe o no está publicado.",
      );
    }

    return course;
  },

  async getPublishedLesson(lessonId: string) {
    const lesson =
      await learningStructureRepository.findPublishedLessonById(lessonId);

    if (!lesson) {
      throw new AppError(
        404,
        "LESSON_NOT_FOUND",
        "La lección no existe o no está publicada.",
      );
    }

    return lesson;
  },
};
