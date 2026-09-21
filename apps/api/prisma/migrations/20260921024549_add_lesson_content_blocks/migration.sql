-- CreateEnum
CREATE TYPE "ContentBlockType" AS ENUM ('TEXT', 'HEADING', 'IMAGE', 'AUDIO', 'VIDEO', 'DIALOGUE', 'EXAMPLE', 'NOTE', 'VOCABULARY', 'DOCUMENT', 'QUIZ');

-- CreateTable
CREATE TABLE "lesson_content_blocks" (
    "id" UUID NOT NULL,
    "lesson_id" UUID NOT NULL,
    "type" "ContentBlockType" NOT NULL,
    "title" VARCHAR(200),
    "content" JSONB NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "lesson_content_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lesson_content_blocks_lesson_id_idx" ON "lesson_content_blocks"("lesson_id");

-- CreateIndex
CREATE INDEX "lesson_content_blocks_type_idx" ON "lesson_content_blocks"("type");

-- CreateIndex
CREATE INDEX "lesson_content_blocks_position_idx" ON "lesson_content_blocks"("position");

-- CreateIndex
CREATE INDEX "lesson_content_blocks_deleted_at_idx" ON "lesson_content_blocks"("deleted_at");

-- AddForeignKey
ALTER TABLE "lesson_content_blocks" ADD CONSTRAINT "lesson_content_blocks_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
