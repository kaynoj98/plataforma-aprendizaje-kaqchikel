import type { RequestHandler } from "express";

import { AppError } from "../../errors/app-error.js";

import { courseService } from "./course.service.js";
import type {
  AdminListCoursesQuery,
  CourseIdParams,
  CourseSlugParams,
  CreateCourseInput,
  PublicListCoursesQuery,
  UpdateCourseInput,
} from "./course.schemas.js";

function requireAuthUserId(request: Parameters<RequestHandler>[0]): string {
  if (!request.auth) {
    throw new AppError(401, "AUTHENTICATION_REQUIRED", "Debes iniciar sesión.");
  }

  return request.auth.user.id;
}

export const listPublicCourses: RequestHandler = async (request, response) => {
  const query = request.validatedQuery as PublicListCoursesQuery;

  const result = await courseService.listPublished(query);

  response.status(200).json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
};

export const getPublicCourseBySlug: RequestHandler = async (
  request,
  response,
) => {
  const params = request.validatedParams as CourseSlugParams;

  const course = await courseService.getPublicPreviewBySlug(params.slug);

  response.status(200).json({
    success: true,
    data: {
      course,
    },
  });
};

export const listPublishedCourses: RequestHandler = async (
  request,
  response,
) => {
  const query = request.validatedQuery as PublicListCoursesQuery;

  const result = await courseService.listPublished(query);

  response.status(200).json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
};

export const getPublishedCourseById: RequestHandler = async (
  request,
  response,
) => {
  const params = request.validatedParams as CourseIdParams;

  const course = await courseService.getPublishedById(params.courseId);

  response.status(200).json({
    success: true,
    data: {
      course,
    },
  });
};

export const listAdminCourses: RequestHandler = async (request, response) => {
  const query = request.validatedQuery as AdminListCoursesQuery;

  const result = await courseService.listAdmin(query);

  response.status(200).json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
};

export const createCourse: RequestHandler = async (request, response) => {
  const actorUserId = requireAuthUserId(request);

  const input = request.body as CreateCourseInput;

  const course = await courseService.create(actorUserId, input);

  response.status(201).json({
    success: true,
    data: {
      course,
    },
    message: "El curso fue creado correctamente.",
  });
};

export const getAdminCourseById: RequestHandler = async (request, response) => {
  const params = request.validatedParams as CourseIdParams;

  const course = await courseService.getAdminById(params.courseId);

  response.status(200).json({
    success: true,
    data: {
      course,
    },
  });
};

export const updateCourse: RequestHandler = async (request, response) => {
  const actorUserId = requireAuthUserId(request);

  const params = request.validatedParams as CourseIdParams;

  const input = request.body as UpdateCourseInput;

  const course = await courseService.update(
    actorUserId,
    params.courseId,
    input,
  );

  response.status(200).json({
    success: true,
    data: {
      course,
    },
    message: "El curso fue actualizado correctamente.",
  });
};

export const publishCourse: RequestHandler = async (request, response) => {
  const actorUserId = requireAuthUserId(request);

  const params = request.validatedParams as CourseIdParams;

  const course = await courseService.publish(actorUserId, params.courseId);

  response.status(200).json({
    success: true,
    data: {
      course,
    },
    message: "El curso fue publicado correctamente.",
  });
};

export const unpublishCourse: RequestHandler = async (request, response) => {
  const actorUserId = requireAuthUserId(request);

  const params = request.validatedParams as CourseIdParams;

  const course = await courseService.unpublish(actorUserId, params.courseId);

  response.status(200).json({
    success: true,
    data: {
      course,
    },
    message: "El curso fue despublicado correctamente.",
  });
};

export const archiveCourse: RequestHandler = async (request, response) => {
  const actorUserId = requireAuthUserId(request);

  const params = request.validatedParams as CourseIdParams;

  const course = await courseService.archive(actorUserId, params.courseId);

  response.status(200).json({
    success: true,
    data: {
      course,
    },
    message: "El curso fue archivado correctamente.",
  });
};

export const deleteCourse: RequestHandler = async (request, response) => {
  const actorUserId = requireAuthUserId(request);

  const params = request.validatedParams as CourseIdParams;

  const course = await courseService.softDelete(actorUserId, params.courseId);

  response.status(200).json({
    success: true,
    data: {
      course,
    },
    message: "El curso fue eliminado correctamente.",
  });
};
