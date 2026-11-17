BEGIN;
-- AlterEnum
ALTER TYPE "ActivityType" ADD VALUE 'WRITING';

-- AlterTable
ALTER TABLE "activity_questions" ADD COLUMN     "variant_snapshot" TEXT;

-- CreateTable
CREATE TABLE "activity_writing_submissions" (
    "attempt_id" UUID NOT NULL,
    "version_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "request_id" UUID NOT NULL,
    "response_text" VARCHAR(500) NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "answered_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_writing_submissions_pkey" PRIMARY KEY ("attempt_id","question_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "activity_writing_submissions_attempt_id_request_id_key" ON "activity_writing_submissions"("attempt_id", "request_id");

-- AddForeignKey
ALTER TABLE "activity_writing_submissions" ADD CONSTRAINT "activity_writing_submissions_attempt_id_version_id_fkey" FOREIGN KEY ("attempt_id", "version_id") REFERENCES "activity_attempts"("id", "version_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_writing_submissions" ADD CONSTRAINT "activity_writing_submissions_question_id_version_id_fkey" FOREIGN KEY ("question_id", "version_id") REFERENCES "activity_questions"("id", "version_id") ON DELETE RESTRICT ON UPDATE CASCADE;


COMMIT;
