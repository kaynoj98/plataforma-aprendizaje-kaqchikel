import type { Prisma } from "../../generated/prisma/client.js";
import { AccountStatus, ProfileType } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";

import type { ListUsersQuery, UpdateMeInput } from "./user.schemas.js";

const publicUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  profileType: true,
  status: true,
  emailVerifiedAt: true,
  lastLoginAt: true,
  blockedAt: true,
  blockedReason: true,
  disabledAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

function buildUserWhere(query: ListUsersQuery): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {};

  if (query.role) {
    where.role = query.role;
  }

  if (query.profileType) {
    where.profileType = query.profileType;
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.search) {
    where.OR = [
      {
        firstName: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        lastName: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: query.search,
          mode: "insensitive",
        },
      },
    ];
  }

  return where;
}

export const userRepository = {
  findPublicById(userId: string) {
    return prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: publicUserSelect,
    });
  },

  updateMe(userId: string, input: UpdateMeInput) {
    return prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        ...(input.firstName ? { firstName: input.firstName } : {}),

        ...(input.lastName ? { lastName: input.lastName } : {}),

        ...(input.profileType
          ? {
              profileType: ProfileType[input.profileType],
            }
          : {}),
      },

      select: publicUserSelect,
    });
  },

  async listUsers(query: ListUsersQuery) {
    const where = buildUserWhere(query);

    const skip = (query.page - 1) * query.pageSize;

    const take = query.pageSize;

    const orderBy = {
      [query.sortBy]: query.sortOrder,
    } as Prisma.UserOrderByWithRelationInput;

    const [totalItems, users] = await prisma.$transaction([
      prisma.user.count({
        where,
      }),

      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take,
        select: publicUserSelect,
      }),
    ]);

    return {
      users,
      totalItems,
    };
  },

  updateUserStatus(data: {
    actorUserId: string;
    targetUserId: string;
    status: AccountStatus;
    reason?: string;
  }) {
    const now = new Date();

    return prisma.$transaction(async (transaction) => {
      const currentUser = await transaction.user.findUnique({
        where: {
          id: data.targetUserId,
        },

        select: publicUserSelect,
      });

      if (!currentUser) {
        return null;
      }

      const updateData: Prisma.UserUpdateInput =
        data.status === AccountStatus.ACTIVE
          ? {
              status: AccountStatus.ACTIVE,
              blockedAt: null,
              blockedReason: null,
              disabledAt: null,
              emailVerifiedAt: currentUser.emailVerifiedAt ?? now,
            }
          : data.status === AccountStatus.BLOCKED
            ? {
                status: AccountStatus.BLOCKED,
                blockedAt: now,
                blockedReason: data.reason ?? null,
                disabledAt: null,
              }
            : {
                status: AccountStatus.DISABLED,
                disabledAt: now,
                blockedAt: null,
                blockedReason: null,
              };

      const updatedUser = await transaction.user.update({
        where: {
          id: data.targetUserId,
        },

        data: updateData,

        select: publicUserSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorUserId: data.actorUserId,
          action: "USER_STATUS_UPDATED",
          entityType: "User",
          entityId: data.targetUserId,
          oldValues: {
            status: currentUser.status,
            blockedAt: currentUser.blockedAt,
            blockedReason: currentUser.blockedReason,
            disabledAt: currentUser.disabledAt,
          },
          newValues: {
            status: updatedUser.status,
            blockedAt: updatedUser.blockedAt,
            blockedReason: updatedUser.blockedReason,
            disabledAt: updatedUser.disabledAt,
          },
          metadata: {
            reason: data.reason ?? null,
          },
        },
      });

      if (
        data.status === AccountStatus.BLOCKED ||
        data.status === AccountStatus.DISABLED
      ) {
        await transaction.session.updateMany({
          where: {
            userId: data.targetUserId,
            revokedAt: null,
          },

          data: {
            revokedAt: now,
          },
        });
      }

      return updatedUser;
    });
  },
};
