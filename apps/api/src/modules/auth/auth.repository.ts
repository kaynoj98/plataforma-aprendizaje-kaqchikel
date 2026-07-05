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
  verificationTokenHash: string;
  verificationExpiresAt: Date;
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

  findVerificationUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },

      select: {
        id: true,
        email: true,
        status: true,
        emailVerifiedAt: true,
      },
    });
  },

  findPasswordResetUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },

      select: {
        id: true,
        email: true,
        status: true,
        emailVerifiedAt: true,
      },
    });
  },

  createPendingUser(data: CreatePendingUserData) {
    return prisma.$transaction(async (transaction) => {
      const user = await transaction.user.create({
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

      await transaction.emailVerificationToken.create({
        data: {
          userId: user.id,

          tokenHash: data.verificationTokenHash,

          expiresAt: data.verificationExpiresAt,
        },
      });

      return user;
    });
  },

  replaceVerificationToken(userId: string, tokenHash: string, expiresAt: Date) {
    return prisma.$transaction(async (transaction) => {
      await transaction.emailVerificationToken.deleteMany({
        where: {
          userId,
          usedAt: null,
        },
      });

      return transaction.emailVerificationToken.create({
        data: {
          userId,
          tokenHash,
          expiresAt,
        },
      });
    });
  },

  consumeVerificationToken(tokenHash: string, now: Date) {
    return prisma.$transaction(async (transaction) => {
      const token = await transaction.emailVerificationToken.findUnique({
        where: {
          tokenHash,
        },

        select: {
          id: true,
          userId: true,
          expiresAt: true,
          usedAt: true,

          user: {
            select: publicUserSelect,
          },
        },
      });

      if (!token) {
        return {
          status: "INVALID",
        } as const;
      }

      if (token.usedAt) {
        return {
          status: "USED",
        } as const;
      }

      if (token.expiresAt <= now) {
        return {
          status: "EXPIRED",
        } as const;
      }

      if (
        token.user.status === AccountStatus.BLOCKED ||
        token.user.status === AccountStatus.DISABLED
      ) {
        return {
          status: "ACCOUNT_UNAVAILABLE",
        } as const;
      }

      const consumed = await transaction.emailVerificationToken.updateMany({
        where: {
          id: token.id,
          usedAt: null,
        },

        data: {
          usedAt: now,
        },
      });

      if (consumed.count !== 1) {
        return {
          status: "USED",
        } as const;
      }

      const user =
        token.user.status === AccountStatus.PENDING
          ? await transaction.user.update({
              where: {
                id: token.userId,
              },

              data: {
                status: AccountStatus.ACTIVE,

                emailVerifiedAt: token.user.emailVerifiedAt ?? now,
              },

              select: publicUserSelect,
            })
          : token.user;

      await transaction.emailVerificationToken.deleteMany({
        where: {
          userId: token.userId,
          id: {
            not: token.id,
          },
        },
      });

      return {
        status: "SUCCESS",
        user,
      } as const;
    });
  },

  replacePasswordResetToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ) {
    return prisma.$transaction(async (transaction) => {
      await transaction.passwordResetToken.deleteMany({
        where: {
          userId,
          usedAt: null,
        },
      });

      return transaction.passwordResetToken.create({
        data: {
          userId,
          tokenHash,
          expiresAt,
        },
      });
    });
  },

  consumePasswordResetToken(
    tokenHash: string,
    passwordHash: string,
    now: Date,
  ) {
    return prisma.$transaction(async (transaction) => {
      const token = await transaction.passwordResetToken.findUnique({
        where: {
          tokenHash,
        },

        select: {
          id: true,
          userId: true,
          expiresAt: true,
          usedAt: true,

          user: {
            select: {
              status: true,
              emailVerifiedAt: true,
            },
          },
        },
      });

      if (!token) {
        return {
          status: "INVALID",
        } as const;
      }

      if (token.usedAt) {
        return {
          status: "USED",
        } as const;
      }

      if (token.expiresAt <= now) {
        return {
          status: "EXPIRED",
        } as const;
      }

      if (
        token.user.status !== AccountStatus.ACTIVE ||
        !token.user.emailVerifiedAt
      ) {
        return {
          status: "ACCOUNT_UNAVAILABLE",
        } as const;
      }

      const consumed = await transaction.passwordResetToken.updateMany({
        where: {
          id: token.id,
          usedAt: null,
        },

        data: {
          usedAt: now,
        },
      });

      if (consumed.count !== 1) {
        return {
          status: "USED",
        } as const;
      }

      await transaction.user.update({
        where: {
          id: token.userId,
        },

        data: {
          passwordHash,
        },
      });

      await transaction.session.updateMany({
        where: {
          userId: token.userId,
          revokedAt: null,
        },

        data: {
          revokedAt: now,
        },
      });

      await transaction.passwordResetToken.deleteMany({
        where: {
          userId: token.userId,
          id: {
            not: token.id,
          },
        },
      });

      return {
        status: "SUCCESS",
      } as const;
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
