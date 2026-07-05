import argon2 from "argon2";

import { AppError } from "../../errors/app-error.js";
import { AccountStatus, ProfileType } from "../../generated/prisma/client.js";
import { generateSecureToken, hashToken } from "../../utils/token.js";

import { createSessionExpiration } from "./auth.cookie.js";
import { authRepository } from "./auth.repository.js";
import type { LoginInput, RegisterInput } from "./auth.schemas.js";
import type { AuthContext } from "./auth.types.js";

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export const authService = {
  async register(input: RegisterInput) {
    const email = input.email.trim().toLowerCase();

    const existingUser = await authRepository.findUserByEmail(email);

    if (existingUser) {
      throw new AppError(
        409,
        "EMAIL_ALREADY_REGISTERED",
        "El correo electrónico ya está registrado.",
      );
    }

    const passwordHash = await argon2.hash(input.password, {
      type: argon2.argon2id,
    });

    try {
      return await authRepository.createPendingUser({
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        email,
        passwordHash,
        profileType: ProfileType[input.profileType],
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new AppError(
          409,
          "EMAIL_ALREADY_REGISTERED",
          "El correo electrónico ya está registrado.",
        );
      }

      throw error;
    }
  },

  async login(
    input: LoginInput,
    metadata: {
      ipAddress: string | null;
      userAgent: string | null;
    },
  ) {
    const email = input.email.trim().toLowerCase();

    const user = await authRepository.findUserByEmail(email);

    if (!user) {
      throw new AppError(
        401,
        "INVALID_CREDENTIALS",
        "El correo o la contraseña son incorrectos.",
      );
    }

    const validPassword = await argon2.verify(
      user.passwordHash,
      input.password,
    );

    if (!validPassword) {
      throw new AppError(
        401,
        "INVALID_CREDENTIALS",
        "El correo o la contraseña son incorrectos.",
      );
    }

    switch (user.status) {
      case AccountStatus.PENDING:
        throw new AppError(
          403,
          "EMAIL_NOT_VERIFIED",
          "Debes confirmar tu correo electrónico antes de iniciar sesión.",
        );

      case AccountStatus.BLOCKED:
        throw new AppError(
          403,
          "ACCOUNT_BLOCKED",
          "La cuenta se encuentra bloqueada.",
        );

      case AccountStatus.DISABLED:
        throw new AppError(
          403,
          "ACCOUNT_DISABLED",
          "La cuenta se encuentra desactivada.",
        );

      case AccountStatus.ACTIVE:
        break;
    }

    const sessionToken = generateSecureToken();

    const sessionTokenHash = hashToken(sessionToken);

    const expiresAt = createSessionExpiration();

    const session = await authRepository.createLoginSession({
      userId: user.id,
      tokenHash: sessionTokenHash,
      expiresAt,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
    });

    const { passwordHash: _passwordHash, ...publicUser } = user;

    return {
      sessionToken,
      sessionId: session.id,
      expiresAt: session.expiresAt,
      user: {
        ...publicUser,
        lastLoginAt: new Date(),
      },
    };
  },

  async validateSession(sessionToken: string): Promise<AuthContext> {
    const tokenHash = hashToken(sessionToken);

    const session = await authRepository.findSessionWithUser(tokenHash);

    if (!session || session.revokedAt || session.expiresAt <= new Date()) {
      throw new AppError(
        401,
        "INVALID_SESSION",
        "La sesión no es válida o ha expirado.",
      );
    }

    if (session.user.status !== AccountStatus.ACTIVE) {
      await authRepository.revokeSession(tokenHash);

      throw new AppError(
        401,
        "INVALID_SESSION",
        "La sesión ya no está autorizada.",
      );
    }

    return {
      sessionId: session.id,
      expiresAt: session.expiresAt,
      user: session.user,
    };
  },

  async logout(sessionToken: string | null): Promise<void> {
    if (!sessionToken) {
      return;
    }

    await authRepository.revokeSession(hashToken(sessionToken));
  },

  async logoutAll(userId: string): Promise<void> {
    await authRepository.revokeAllUserSessions(userId);
  },
};
