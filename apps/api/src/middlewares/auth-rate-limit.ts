import { rateLimit } from "express-rate-limit";

function createRateLimitResponse(message: string) {
  return {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message,
    },
  };
}

export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  handler: (_request, response) => {
    response
      .status(429)
      .json(
        createRateLimitResponse(
          "Has realizado demasiados intentos de registro. Intenta nuevamente más tarde.",
        ),
      );
  },
});

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  handler: (_request, response) => {
    response
      .status(429)
      .json(
        createRateLimitResponse(
          "Has realizado demasiados intentos de inicio de sesión. Intenta nuevamente más tarde.",
        ),
      );
  },
});

export const verificationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  handler: (_request, response) => {
    response
      .status(429)
      .json(
        createRateLimitResponse(
          "Has realizado demasiadas solicitudes de confirmación. Intenta nuevamente más tarde.",
        ),
      );
  },
});

export const passwordRecoveryRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  handler: (_request, response) => {
    response
      .status(429)
      .json(
        createRateLimitResponse(
          "Has realizado demasiadas solicitudes de recuperación. Intenta nuevamente más tarde.",
        ),
      );
  },
});

export const resetPasswordRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  handler: (_request, response) => {
    response
      .status(429)
      .json(
        createRateLimitResponse(
          "Has realizado demasiados intentos de restablecimiento. Intenta nuevamente más tarde.",
        ),
      );
  },
});
