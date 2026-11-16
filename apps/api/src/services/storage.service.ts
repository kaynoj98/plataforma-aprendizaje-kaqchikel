import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  S3ServiceException,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { createReadStream } from "node:fs";

import sharp from "sharp";
import { createHash } from "node:crypto";
import { AppError } from "../errors/app-error.js";
import { env } from "../config/env.js";

const client = new S3Client({
  endpoint: env.S3_ENDPOINT,
  region: env.S3_REGION,

  forcePathStyle: env.S3_FORCE_PATH_STYLE,

  credentials: {
    accessKeyId: env.S3_ACCESS_KEY,

    secretAccessKey: env.S3_SECRET_KEY,
  },
});

export function practiceImageKey(objectKey: string) {
  return (
    "practice-images/" +
    createHash("sha256").update(objectKey).digest("hex") +
    ".webp"
  );
}

export const storageService = {
  async verify(): Promise<void> {
    await client.send(
      new HeadBucketCommand({
        Bucket: env.S3_BUCKET,
      }),
    );
  },

  async upload(data: {
    objectKey: string;
    filePath: string;
    contentType: string;
  }): Promise<void> {
    await client.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,

        Key: data.objectKey,

        Body: createReadStream(data.filePath),

        ContentType: data.contentType,
      }),
    );
  },

  async delete(objectKey: string): Promise<void> {
    await client.send(
      new DeleteObjectCommand({
        Bucket: env.S3_BUCKET,

        Key: objectKey,
      }),
    );
  },

  async preparePracticeImage(objectKey: string) {
    // La proyección no expone el identificador del original ni sus metadatos incrustados.
    const Key = practiceImageKey(objectKey);
    const target = { Bucket: env.S3_BUCKET, Key };
    try {
      await client.send(new HeadObjectCommand(target));
      return Key;
    } catch (error) {
      if (
        !(
          error instanceof S3ServiceException &&
          error.$metadata.httpStatusCode === 404
        )
      )
        throw error;
    }
    const source = await client.send(
      new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: objectKey }),
    );
    if (
      !source.Body ||
      !source.ContentLength ||
      source.ContentLength > 10 * 1024 * 1024
    )
      throw new AppError(
        400,
        "INVALID_IMAGE",
        "La imagen no está disponible o supera 10 MiB.",
      );
    const bytes = await source.Body.transformToByteArray();
    const decoder = sharp(bytes, {
      limitInputPixels: 64000000,
      failOn: "warning",
    });
    let body: Buffer;
    try {
      const { format } = await decoder.metadata();
      if (!["png", "jpeg", "webp", "gif"].includes(format)) throw Error();
      body = await decoder
        .rotate()
        .resize({
          width: 1600,
          height: 1600,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp()
        .toBuffer();
    } catch {
      throw new AppError(
        400,
        "INVALID_IMAGE",
        "No se pudo interpretar la imagen seleccionada.",
      );
    }
    await client.send(
      new PutObjectCommand({
        ...target,
        ContentType: "image/webp",
        Body: body,
      }),
    );
    return Key;
  },

  async createAccessUrl(
    objectKey: string,
    options?: {
      downloadName?: string;
    },
  ): Promise<string> {
    const expiresIn = env.MEDIA_ACCESS_URL_MINUTES * 60;

    const command = new GetObjectCommand({
      Bucket: env.S3_BUCKET,

      Key: objectKey,

      ...(options?.downloadName
        ? {
            ResponseContentDisposition: `attachment; filename="${options.downloadName}"`,
          }
        : {}),
    });

    return getSignedUrl(client, command, {
      expiresIn,
    });
  },
};
