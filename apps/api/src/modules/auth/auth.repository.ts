import {
  AccountStatus,
  ProfileType,
  Role,
} from "../../generated/prisma/client.js";

import { prisma } from "../../lib/prisma.js";

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
  createdAt: true,
  updatedAt: true,
} as const;

const loginUserSelect = {
  ...publicUserSelect,
  passwordHash: true,
} as const;

interface CreatePendingUserData {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  profileType: ProfileType;
}

interface CreateSessionData {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
}

export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
      select: loginUserSelect,
    });
  },

  createPendingUser(data: CreatePendingUserData) {
    return prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash: data.passwordHash,
        profileType: data.profileType,
        role: Role.USER,
        status: AccountStatus.PENDING,
      },
      select: publicUserSelect,
    });
  },

  createLoginSession(data: CreateSessionData) {
    return prisma.$transaction(async (transaction) => {
      const session = await transaction.session.create({
        data: {
          userId: data.userId,
          tokenHash: data.tokenHash,
          expiresAt: data.expiresAt,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },

        select: {
          id: true,
          expiresAt: true,
        },
      });

      await transaction.user.update({
        where: {
          id: data.userId,
        },
        data: {
          lastLoginAt: new Date(),
        },
      });

      return session;
    });
  },

  findSessionWithUser(tokenHash: string) {
    return prisma.session.findUnique({
      where: {
        tokenHash,
      },

      select: {
        id: true,
        expiresAt: true,
        revokedAt: true,

        user: {
          select: publicUserSelect,
        },
      },
    });
  },

  revokeSession(tokenHash: string) {
    return prisma.session.updateMany({
      where: {
        tokenHash,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  },

  revokeAllUserSessions(userId: string) {
    return prisma.session.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  },
};
