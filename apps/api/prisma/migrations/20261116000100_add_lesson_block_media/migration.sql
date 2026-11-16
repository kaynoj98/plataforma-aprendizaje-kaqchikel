BEGIN;
-- AlterTable
ALTER TABLE "lesson_content_blocks" ADD COLUMN     "media_id" UUID;

-- CreateIndex
CREATE INDEX "lesson_content_blocks_media_id_idx" ON "lesson_content_blocks"("media_id");

-- AddForeignKey
ALTER TABLE "lesson_content_blocks" ADD CONSTRAINT "lesson_content_blocks_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;
