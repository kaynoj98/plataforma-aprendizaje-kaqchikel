BEGIN;
-- AlterEnum
ALTER TYPE "ActivityType" ADD VALUE 'IMAGE_RECOGNITION';

-- AlterTable
ALTER TABLE "activity_questions" ADD COLUMN     "image_description" TEXT,
ADD COLUMN     "image_media_id" UUID;

-- CreateIndex
CREATE INDEX "activity_questions_image_media_id_idx" ON "activity_questions"("image_media_id");

-- AddForeignKey
ALTER TABLE "activity_questions" ADD CONSTRAINT "activity_questions_image_media_id_fkey" FOREIGN KEY ("image_media_id") REFERENCES "media_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


COMMIT;
