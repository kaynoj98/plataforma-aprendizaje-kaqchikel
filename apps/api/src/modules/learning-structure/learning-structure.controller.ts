import type { RequestHandler } from "express";

import { AppError } from "../../errors/app-error.js";

import { learningStructureService } from "./learning-structure.service.js";
import type {
  CourseIdParams,
  CreateLessonInput,
  CreateLevelInput,
  CreateUnitInput,
  LessonIdParams,
  LevelIdParams,
  ListChildrenQuery,
  UnitIdParams,
  UpdateLessonInput,
  UpdateLevelInput,
  UpdateUnitInput,
} from "./learning-structure.schemas.js";

function requireAuthUserId(request: Parameters<RequestHandler>[0]): string {
  if (!request.auth) {
    throw new AppError(401, "AUTHENTICATION_REQUIRED", "Debes iniciar sesión.");
  }

  return request.auth.user.id;
}

export const getCourseStructure: RequestHandler = async (request, response) => {
  const params = request.validatedParams as CourseIdParams;

  const course = await learningStructureService.getPublishedStructure(
    params.courseId,
  );

  response.status(200).json({
    success: true,
    data: {
      course,
    },
  });
};

export const getLesson: RequestHandler = async (request, response) => {
  const params = request.validatedParams as LessonIdParams;

  const lesson = await learningStructureService.getPublishedLesson(
    params.lessonId,
  );

  response.status(200).json({
    success: true,
    data: {
      lesson,
    },
  });
};

export const listLevels: RequestHandler = async (request, response) => {
  const params = request.validatedParams as CourseIdParams;
  const query = request.validatedQuery as ListChildrenQuery;

  const levels = await learningStructureService.listLevels(
    params.courseId,
    query,
  );

  response.status(200).json({
    success: true,
    data: {
      levels,
    },
  });
};

export const createLevel: RequestHandler = async (request, response) => {
  const actorUserId = requireAuthUserId(request);
  const params = request.validatedParams as CourseIdParams;
  const input = request.body as CreateLevelInput;

  const level = await learningStructureService.createLevel(
    actorUserId,
    params.courseId,
    input,
  );

  response.status(201).json({
    success: true,
    data: {
      level,
    },
    message: "El nivel fue creado correctamente.",
  });
};

export const updateLevel: RequestHandler = async (request, response) => {
  const actorUserId = requireAuthUserId(request);
  const params = request.validatedParams as LevelIdParams;
  const input = request.body as UpdateLevelInput;

  const level = await learningStructureService.updateLevel(
    actorUserId,
    params.levelId,
    input,
  );

  response.status(200).json({
    success: true,
    data: {
      level,
    },
    message: "El nivel fue actualizado correctamente.",
  });
};

export const deleteLevel: RequestHandler = async (request, response) => {
  const actorUserId = requireAuthUserId(request);
  const params = request.validatedParams as LevelIdParams;

  const level = await learningStructureService.deleteLevel(
    actorUserId,
    params.levelId,
  );

  response.status(200).json({
    success: true,
    data: {
      level,
    },
    message: "El nivel fue eliminado correctamente.",
  });
};

export const publishLevel: RequestHandler = async (request, response) => {
  const actorUserId = requireAuthUserId(request);
  const params = request.validatedParams as LevelIdParams;

  const level = await learningStructureService.publishLevel(
    actorUserId,
    params.levelId,
  );

  response.status(200).json({
    success: true,
    data: {
      level,
    },
    message: "El nivel fue publicado correctamente.",
  });
};

export const unpublishLevel: RequestHandler = async (request, response) => {
  const actorUserId = requireAuthUserId(request);
  const params = request.validatedParams as LevelIdParams;

  const level = await learningStructureService.unpublishLevel(
    actorUserId,
    params.levelId,
  );

  response.status(200).json({
    success: true,
    data: {
      level,
    },
    message: "El nivel fue despublicado correctamente.",
  });
};

export const archiveLevel: RequestHandler = async (request, response) => {
  const actorUserId = requireAuthUserId(request);
  const params = request.validatedParams as LevelIdParams;

  const level = await learningStructureService.archiveLevel(
    actorUserId,
    params.levelId,
  );

  response.status(200).json({
    success: true,
    data: {
      level,
    },
    message: "El nivel fue archivado correctamente.",
  });
};

export const listUnits: RequestHandler = async (request, response) => {
  const params = request.validatedParams as LevelIdParams;
  const query = request.validatedQuery as ListChildrenQuery;

  const units = await learningStructureService.listUnits(params.levelId, query);

  response.status(200).json({
    success: true,
    data: {
      units,
    },
  });
};

export const createUnit: RequestHandler = async (request, response) => {
  const actorUserId = requireAuthUserId(request);
  const params = request.validatedParams as LevelIdParams;
  const input = request.body as CreateUnitInput;

  const unit = await learningStructureService.createUnit(
    actorUserId,
    params.levelId,
    input,
  );

  response.status(201).json({
    success: true,
    data: {
      unit,
    },
    message: "La unidad fue creada correctamente.",
  });
};

export const updateUnit: RequestHandler = async (request, response) => {
  const actorUserId = requireAuthUserId(request);
  const params = request.validatedParams as UnitIdParams;
  const input = request.body as UpdateUnitInput;

  const unit = await learningStructureService.updateUnit(
    actorUserId,
    params.unitId,
    input,
  );

  response.status(200).json({
    success: true,
    data: {
      unit,
    },
    message: "La unidad fue actualizada correctamente.",
  });
};

export const deleteUnit: RequestHandler = async (request, response) => {
  const actorUserId = requireAuthUserId(request);
  const params = request.validatedParams as UnitIdParams;

  const unit = await learningStructureService.deleteUnit(
    actorUserId,
    params.unitId,
  );

  response.status(200).json({
    success: true,
    data: {
      unit,
    },
    message: "La unidad fue eliminada correctamente.",
  });
};

export const publishUnit: RequestHandler = async (request, response) => {
  const actorUserId = requireAuthUserId(request);
  const params = request.validatedParams as UnitIdParams;

  const unit = await learningStructureService.publishUnit(
    actorUserId,
    params.unitId,
  );

  response.status(200).json({
    success: true,
    data: {
      unit,
    },
    message: "La unidad fue publicada correctamente.",
  });
};

export const unpublishUnit: RequestHandler = async (request, response) => {
  const actorUserId = requireAuthUserId(request);
  const params = request.validatedParams as UnitIdParams;

  const unit = await learningStructureService.unpublishUnit(
    actorUserId,
    params.unitId,
  );

  response.status(200).json({
    success: true,
    data: {
      unit,
    },
    message: "La unidad fue despublicada correctamente.",
  });
};

export const archiveUnit: RequestHandler = async (request, response) => {
  const actorUserId = requireAuthUserId(request);
  const params = request.validatedParams as UnitIdParams;

  const unit = await learningStructureService.archiveUnit(
    actorUserId,
    params.unitId,
  );

  response.status(200).json({
    success: true,
    data: {
      unit,
    },
    message: "La unidad fue archivada correctamente.",
  });
};

export const listLessons: RequestHandler = async (request, response) => {
  const params = request.validatedParams as UnitIdParams;
  const query = request.validatedQuery as ListChildrenQuery;

  const lessons = await learningStructureService.listLessons(
    params.unitId,
    query,
  );

  response.status(200).json({
    success: true,
    data: {
      lessons,
    },
  });
};

export const createLesson: RequestHandler = async (request, response) => {
  const actorUserId = requireAuthUserId(request);
  const params = request.validatedParams as UnitIdParams;
  const input = request.body as CreateLessonInput;

  const lesson = await learningStructureService.createLesson(
    actorUserId,
    params.unitId,
    input,
  );

  response.status(201).json({
    success: true,
    data: {
      lesson,
    },
    message: "La lección fue creada correctamente.",
  });
};

export const getAdminLesson: RequestHandler = async (request, response) => {
  const params = request.validatedParams as LessonIdParams;

  const lesson = await learningStructureService.getAdminLesson(params.lessonId);

  response.status(200).json({
    success: true,
    data: {
      lesson,
    },
  });
};

export const updateLesson: RequestHandler = async (request, response) => {
  const actorUserId = requireAuthUserId(request);
  const params = request.validatedParams as LessonIdParams;
  const input = request.body as UpdateLessonInput;

  const lesson = await learningStructureService.updateLesson(
    actorUserId,
    params.lessonId,
    input,
  );

  response.status(200).json({
    success: true,
    data: {
      lesson,
    },
    message: "La lección fue actualizada correctamente.",
  });
};

export const deleteLesson: RequestHandler = async (request, response) => {
  const actorUserId = requireAuthUserId(request);
  const params = request.validatedParams as LessonIdParams;

  const lesson = await learningStructureService.deleteLesson(
    actorUserId,
    params.lessonId,
  );

  response.status(200).json({
    success: true,
    data: {
      lesson,
    },
    message: "La lección fue eliminada correctamente.",
  });
};

export const publishLesson: RequestHandler = async (request, response) => {
  const actorUserId = requireAuthUserId(request);
  const params = request.validatedParams as LessonIdParams;

  const lesson = await learningStructureService.publishLesson(
    actorUserId,
    params.lessonId,
  );

  response.status(200).json({
    success: true,
    data: {
      lesson,
    },
    message: "La lección fue publicada correctamente.",
  });
};

export const unpublishLesson: RequestHandler = async (request, response) => {
  const actorUserId = requireAuthUserId(request);
  const params = request.validatedParams as LessonIdParams;

  const lesson = await learningStructureService.unpublishLesson(
    actorUserId,
    params.lessonId,
  );

  response.status(200).json({
    success: true,
    data: {
      lesson,
    },
    message: "La lección fue despublicada correctamente.",
  });
};

export const archiveLesson: RequestHandler = async (request, response) => {
  const actorUserId = requireAuthUserId(request);
  const params = request.validatedParams as LessonIdParams;

  const lesson = await learningStructureService.archiveLesson(
    actorUserId,
    params.lessonId,
  );

  response.status(200).json({
    success: true,
    data: {
      lesson,
    },
    message: "La lección fue archivada correctamente.",
  });
};
