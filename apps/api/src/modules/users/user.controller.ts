import type { RequestHandler } from "express";

import { AppError } from "../../errors/app-error.js";

import { userService } from "./user.service.js";
import type {
  ListUsersQuery,
  UpdateMeInput,
  UpdateUserStatusInput,
  UserIdParams,
} from "./user.schemas.js";

function requireAuthUserId(request: Parameters<RequestHandler>[0]): string {
  if (!request.auth) {
    throw new AppError(401, "AUTHENTICATION_REQUIRED", "Debes iniciar sesión.");
  }

  return request.auth.user.id;
}

export const getMe: RequestHandler = async (request, response) => {
  const userId = requireAuthUserId(request);

  const user = await userService.getMe(userId);

  response.status(200).json({
    success: true,
    data: {
      user,
    },
  });
};

export const updateMe: RequestHandler = async (request, response) => {
  const userId = requireAuthUserId(request);

  const input = request.body as UpdateMeInput;

  const user = await userService.updateMe(userId, input);

  response.status(200).json({
    success: true,
    data: {
      user,
    },
    message: "El perfil fue actualizado correctamente.",
  });
};

export const listUsers: RequestHandler = async (request, response) => {
  const query = request.validatedQuery as ListUsersQuery;

  const result = await userService.listUsers(query);

  response.status(200).json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
};

export const getUserById: RequestHandler = async (request, response) => {
  const params = request.validatedParams as UserIdParams;

  const user = await userService.getUserById(params.userId);

  response.status(200).json({
    success: true,
    data: {
      user,
    },
  });
};

export const updateUserStatus: RequestHandler = async (request, response) => {
  const actorUserId = requireAuthUserId(request);

  const params = request.validatedParams as UserIdParams;

  const input = request.body as UpdateUserStatusInput;

  const user = await userService.updateUserStatus(
    actorUserId,
    params.userId,
    input,
  );

  response.status(200).json({
    success: true,
    data: {
      user,
    },
    message: "El estado del usuario fue actualizado correctamente.",
  });
};
