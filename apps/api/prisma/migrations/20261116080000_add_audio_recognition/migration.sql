BEGIN;
-- AlterEnum
ALTER TYPE "ActivityType" ADD VALUE 'AUDIO_RECOGNITION';

-- AlterTable
ALTER TABLE "activity_questions" ADD COLUMN     "audio_media_id" UUID,
ADD COLUMN     "audio_transcript" TEXT;

-- CreateIndex
CREATE INDEX "activity_questions_audio_media_id_idx" ON "activity_questions"("audio_media_id");

-- AddForeignKey
ALTER TABLE "activity_questions" ADD CONSTRAINT "activity_questions_audio_media_id_fkey" FOREIGN KEY ("audio_media_id") REFERENCES "media_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


COMMIT;
