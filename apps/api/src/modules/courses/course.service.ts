import { AppError } from "../../errors/app-error.js";
import { PublishStatus } from "../../generated/prisma/client.js";
import { createSlug } from "../../utils/slug.js";

import { courseRepository } from "./course.repository.js";
import type {
  AdminListCoursesQuery,
  CreateCourseInput,
  PublicListCoursesQuery,
  UpdateCourseInput,
} from "./course.schemas.js";

function normalizeSlug(title: string, requestedSlug?: string): string {
  const slug = createSlug(requestedSlug ?? title);

  if (!slug) {
    throw new AppError(
      400,
      "INVALID_SLUG",
      "No fue posible generar un slug válido para el curso.",
    );
  }

  return slug;
}

async function ensureSlugAvailable(
  slug: string,
  currentCourseId?: string,
): Promise<void> {
  const existing = await courseRepository.findBySlug(slug);

  if (existing && existing.id !== currentCourseId) {
    throw new AppError(
      409,
      "COURSE_SLUG_ALREADY_EXISTS",
      "Ya existe un curso con ese slug.",
    );
  }
}

function buildPagination(totalItems: number, page: number, pageSize: number) {
  return {
    page,
    pageSize,
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize),
  };
}

export const courseService = {
  async listAdmin(query: AdminListCoursesQuery) {
    const result = await courseRepository.listAdmin(query);

    return {
      data: result.courses,
      pagination: buildPagination(
        result.totalItems,
        query.page,
        query.pageSize,
      ),
    };
  },

  async listPublished(query: PublicListCoursesQuery) {
    const result = await courseRepository.listPublished(query);

    return {
      data: result.courses,
      pagination: buildPagination(
        result.totalItems,
        query.page,
        query.pageSize,
      ),
    };
  },

  async getAdminById(courseId: string) {
    const course = await courseRepository.findAdminById(courseId);

    if (!course) {
      throw new AppError(404, "COURSE_NOT_FOUND", "El curso no existe.");
    }

    return course;
  },

  async getPublishedById(courseId: string) {
    const course = await courseRepository.findPublishedById(courseId);

    if (!course) {
      throw new AppError(
        404,
        "COURSE_NOT_FOUND",
        "El curso no existe o no está publicado.",
      );
    }

    return course;
  },

  async getPublicPreviewBySlug(slug: string) {
    const course = await courseRepository.findPublicPreviewBySlug(slug);

    if (!course) {
      throw new AppError(
        404,
        "COURSE_NOT_FOUND",
        "El curso no existe o no tiene vista pública.",
      );
    }

    return course;
  },

  async create(actorUserId: string, input: CreateCourseInput) {
    const slug = normalizeSlug(input.title, input.slug);

    await ensureSlugAvailable(slug);

    return courseRepository.create({
      input,
      slug,
      createdById: actorUserId,
    });
  },

  async update(
    actorUserId: string,
    courseId: string,
    input: UpdateCourseInput,
  ) {
    const current = await courseRepository.findAdminById(courseId);

    if (!current) {
      throw new AppError(404, "COURSE_NOT_FOUND", "El curso no existe.");
    }

    const slug =
      input.slug !== undefined
        ? normalizeSlug(input.title ?? current.title, input.slug)
        : input.title !== undefined
          ? normalizeSlug(input.title)
          : undefined;

    if (slug) {
      await ensureSlugAvailable(slug, courseId);
    }

    const course = await courseRepository.update({
      courseId,
      actorUserId,
      input,
      slug,
    });

    if (!course) {
      throw new AppError(404, "COURSE_NOT_FOUND", "El curso no existe.");
    }

    return course;
  },

  async publish(actorUserId: string, courseId: string) {
    const current = await courseRepository.findAdminById(courseId);

    if (!current) {
      throw new AppError(404, "COURSE_NOT_FOUND", "El curso no existe.");
    }

    if (current.status === PublishStatus.PUBLISHED) {
      return current;
    }

    if (current.description.trim().length < 10) {
      throw new AppError(
        422,
        "COURSE_NOT_READY",
        "El curso no cumple las condiciones mínimas para publicarse.",
      );
    }

    const course = await courseRepository.updateStatus({
      courseId,
      actorUserId,
      status: PublishStatus.PUBLISHED,
    });

    if (!course) {
      throw new AppError(404, "COURSE_NOT_FOUND", "El curso no existe.");
    }

    return course;
  },

  async unpublish(actorUserId: string, courseId: string) {
    const course = await courseRepository.updateStatus({
      courseId,
      actorUserId,
      status: PublishStatus.DRAFT,
    });

    if (!course) {
      throw new AppError(404, "COURSE_NOT_FOUND", "El curso no existe.");
    }

    return course;
  },

  async archive(actorUserId: string, courseId: string) {
    const course = await courseRepository.updateStatus({
      courseId,
      actorUserId,
      status: PublishStatus.ARCHIVED,
    });

    if (!course) {
      throw new AppError(404, "COURSE_NOT_FOUND", "El curso no existe.");
    }

    return course;
  },

  async softDelete(actorUserId: string, courseId: string) {
    const course = await courseRepository.softDelete({
      courseId,
      actorUserId,
    });

    if (!course) {
      throw new AppError(404, "COURSE_NOT_FOUND", "El curso no existe.");
    }

    return course;
  },
};
