import { MediaType } from "../../generated/prisma/client.js";

export const MEDIA_TYPE_BY_MIME: Record<string, MediaType> = {
  "image/jpeg": MediaType.IMAGE,

  "image/png": MediaType.IMAGE,

  "image/webp": MediaType.IMAGE,

  "image/gif": MediaType.IMAGE,

  "audio/mpeg": MediaType.AUDIO,

  "audio/wav": MediaType.AUDIO,

  "audio/x-wav": MediaType.AUDIO,

  "audio/ogg": MediaType.AUDIO,

  "audio/mp4": MediaType.AUDIO,

  "video/mp4": MediaType.VIDEO,

  "video/webm": MediaType.VIDEO,

  "application/pdf": MediaType.DOCUMENT,
};

export const MAX_BYTES_BY_MEDIA_TYPE: Record<MediaType, number> = {
  IMAGE: 10 * 1024 * 1024,

  AUDIO: 30 * 1024 * 1024,

  VIDEO: 250 * 1024 * 1024,

  DOCUMENT: 25 * 1024 * 1024,
};
