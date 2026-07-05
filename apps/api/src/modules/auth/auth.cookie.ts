import type { CookieOptions, Request } from "express";

import { env } from "../../config/env.js";

export const SESSION_COOKIE_NAME =
  env.NODE_ENV === "production"
    ? "__Host-kaqchikel_session"
    : "kaqchikel_session";

export function createSessionExpiration(): Date {
  const durationMilliseconds = env.SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000;

  return new Date(Date.now() + durationMilliseconds);
}

export function getSessionCookieOptions(expiresAt?: Date): CookieOptions {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(expiresAt ? { expires: expiresAt } : {}),
  };
}

export function getSessionTokenFromRequest(request: Request): string | null {
  const token = request.cookies?.[SESSION_COOKIE_NAME];

  return typeof token === "string" ? token : null;
}
