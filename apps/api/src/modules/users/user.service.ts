import { AppError } from "../../errors/app-error.js";
import { AccountStatus } from "../../generated/prisma/client.js";

import { userRepository } from "./user.repository.js";
import type {
  ListUsersQuery,
  UpdateMeInput,
  UpdateUserStatusInput,
} from "./user.schemas.js";

export const userService = {
  async getMe(userId: string) {
    const user = await userRepository.findPublicById(userId);

    if (!user) {
      throw new AppError(404, "USER_NOT_FOUND", "El usuario no existe.");
    }

    return user;
  },

  async updateMe(userId: string, input: UpdateMeInput) {
    try {
      return await userRepository.updateMe(userId, input);
    } catch (error) {
      throw error;
    }
  },

  async listUsers(query: ListUsersQuery) {
    const result = await userRepository.listUsers(query);

    const totalPages = Math.ceil(result.totalItems / query.pageSize);

    return {
      data: result.users,

      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        totalItems: result.totalItems,
        totalPages,
      },
    };
  },

  async getUserById(userId: string) {
    const user = await userRepository.findPublicById(userId);

    if (!user) {
      throw new AppError(404, "USER_NOT_FOUND", "El usuario no existe.");
    }

    return user;
  },

  async updateUserStatus(
    actorUserId: string,
    targetUserId: string,
    input: UpdateUserStatusInput,
  ) {
    if (actorUserId === targetUserId && input.status !== "ACTIVE") {
      throw new AppError(
        400,
        "ADMIN_SELF_STATUS_CHANGE_NOT_ALLOWED",
        "No puedes bloquear o desactivar tu propia cuenta administrativa.",
      );
    }

    const updatedUser = await userRepository.updateUserStatus({
      actorUserId,
      targetUserId,
      status: AccountStatus[input.status],
      reason: input.reason,
    });

    if (!updatedUser) {
      throw new AppError(404, "USER_NOT_FOUND", "El usuario no existe.");
    }

    return updatedUser;
  },
};
