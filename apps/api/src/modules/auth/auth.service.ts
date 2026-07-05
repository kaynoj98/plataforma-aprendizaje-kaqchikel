import argon2 from "argon2";

import { env } from "../../config/env.js";
import { AppError } from "../../errors/app-error.js";
import { AccountStatus, ProfileType } from "../../generated/prisma/client.js";
import { mailService } from "../../services/mail.service.js";
import { generateSecureToken, hashToken } from "../../utils/token.js";

import { createSessionExpiration } from "./auth.cookie.js";
import { authRepository } from "./auth.repository.js";
import type {
  EmailRequestInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "./auth.schemas.js";
import type { AuthContext } from "./auth.types.js";

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

function createVerificationExpiration(): Date {
  return new Date(
    Date.now() + env.EMAIL_VERIFICATION_TOKEN_HOURS * 60 * 60 * 1000,
  );
}

function createPasswordResetExpiration(): Date {
  return new Date(Date.now() + env.PASSWORD_RESET_TOKEN_MINUTES * 60 * 1000);
}

async function sendVerificationSafely(
  email: string,
  token: string,
): Promise<boolean> {
  try {
    await mailService.sendEmailVerification(email, token);

    return true;
  } catch (error) {
    console.error("No fue posible enviar el correo de confirmación:", error);

    return false;
  }
}

async function sendPasswordResetSafely(
  email: string,
  token: string,
): Promise<boolean> {
  try {
    await mailService.sendPasswordReset(email, token);

    return true;
  } catch (error) {
    console.error("No fue posible enviar el correo de recuperación:", error);

    return false;
  }
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

    const verificationToken = generateSecureToken();

    const verificationTokenHash = hashToken(verificationToken);

    try {
      const user = await authRepository.createPendingUser({
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        email,
        passwordHash,

        profileType: ProfileType[input.profileType],

        verificationTokenHash,

        verificationExpiresAt: createVerificationExpiration(),
      });

      const emailSent = await sendVerificationSafely(email, verificationToken);

      return {
        user,
        emailSent,
      };
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

  async verifyEmail(input: VerifyEmailInput) {
    const result = await authRepository.consumeVerificationToken(
      hashToken(input.token),
      new Date(),
    );

    switch (result.status) {
      case "INVALID":
        throw new AppError(
          400,
          "INVALID_VERIFICATION_TOKEN",
          "El enlace de confirmación no es válido.",
        );

      case "USED":
        throw new AppError(
          400,
          "VERIFICATION_TOKEN_USED",
          "El enlace de confirmación ya fue utilizado.",
        );

      case "EXPIRED":
        throw new AppError(
          400,
          "VERIFICATION_TOKEN_EXPIRED",
          "El enlace de confirmación ha expirado.",
        );

      case "ACCOUNT_UNAVAILABLE":
        throw new AppError(
          403,
          "ACCOUNT_UNAVAILABLE",
          "La cuenta no puede ser activada.",
        );

      case "SUCCESS":
        return result.user;
    }
  },

  async resendVerification(input: EmailRequestInput): Promise<void> {
    const email = input.email.trim().toLowerCase();

    const user = await authRepository.findVerificationUserByEmail(email);

    /*
     * Se utiliza la misma respuesta para:
     * - Cuenta inexistente.
     * - Cuenta activa.
     * - Cuenta bloqueada.
     * - Cuenta desactivada.
     *
     * Esto evita revelar el estado de una dirección.
     */
    if (
      !user ||
      user.status !== AccountStatus.PENDING ||
      user.emailVerifiedAt
    ) {
      return;
    }

    const token = generateSecureToken();

    await authRepository.replaceVerificationToken(
      user.id,
      hashToken(token),
      createVerificationExpiration(),
    );

    await sendVerificationSafely(user.email, token);
  },

  async forgotPassword(input: EmailRequestInput): Promise<void> {
    const email = input.email.trim().toLowerCase();

    const user = await authRepository.findPasswordResetUserByEmail(email);

    /*
     * La respuesta será siempre general para no revelar
     * si una cuenta existe.
     */
    if (
      !user ||
      user.status !== AccountStatus.ACTIVE ||
      !user.emailVerifiedAt
    ) {
      return;
    }

    const token = generateSecureToken();

    await authRepository.replacePasswordResetToken(
      user.id,
      hashToken(token),
      createPasswordResetExpiration(),
    );

    await sendPasswordResetSafely(user.email, token);
  },

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const passwordHash = await argon2.hash(input.password, {
      type: argon2.argon2id,
    });

    const result = await authRepository.consumePasswordResetToken(
      hashToken(input.token),
      passwordHash,
      new Date(),
    );

    switch (result.status) {
      case "INVALID":
        throw new AppError(
          400,
          "INVALID_RESET_TOKEN",
          "El enlace de recuperación no es válido.",
        );

      case "USED":
        throw new AppError(
          400,
          "RESET_TOKEN_USED",
          "El enlace de recuperación ya fue utilizado.",
        );

      case "EXPIRED":
        throw new AppError(
          400,
          "RESET_TOKEN_EXPIRED",
          "El enlace de recuperación ha expirado.",
        );

      case "ACCOUNT_UNAVAILABLE":
        throw new AppError(
          403,
          "ACCOUNT_UNAVAILABLE",
          "La contraseña de esta cuenta no puede restablecerse.",
        );

      case "SUCCESS":
        return;
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

    const session = await authRepository.createLoginSession({
      userId: user.id,

      tokenHash: hashToken(sessionToken),

      expiresAt: createSessionExpiration(),

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
