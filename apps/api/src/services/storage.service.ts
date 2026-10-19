import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { createReadStream } from "node:fs";

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
