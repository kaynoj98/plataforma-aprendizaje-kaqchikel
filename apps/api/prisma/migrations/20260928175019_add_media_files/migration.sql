-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'AUDIO', 'VIDEO', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('PROCESSING', 'AVAILABLE', 'FAILED', 'DELETED');

-- CreateTable
CREATE TABLE "media_files" (
    "id" UUID NOT NULL,
    "uploaded_by_id" UUID NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "object_key" VARCHAR(500) NOT NULL,
    "bucket" VARCHAR(100) NOT NULL,
    "media_type" "MediaType" NOT NULL,
    "mime_type" VARCHAR(150) NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "status" "MediaStatus" NOT NULL DEFAULT 'PROCESSING',
    "metadata" JSONB,
    "deleted_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "media_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_files_object_key_key" ON "media_files"("object_key");

-- CreateIndex
CREATE INDEX "media_files_uploaded_by_id_idx" ON "media_files"("uploaded_by_id");

-- CreateIndex
CREATE INDEX "media_files_media_type_idx" ON "media_files"("media_type");

-- CreateIndex
CREATE INDEX "media_files_status_idx" ON "media_files"("status");

-- CreateIndex
CREATE INDEX "media_files_created_at_idx" ON "media_files"("created_at");

-- CreateIndex
CREATE INDEX "media_files_deleted_at_idx" ON "media_files"("deleted_at");

-- AddForeignKey
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
