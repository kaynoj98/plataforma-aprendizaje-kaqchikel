BEGIN;
-- AlterEnum
ALTER TYPE "ActivityType" ADD VALUE 'SENTENCE_ORDERING';

-- AlterTable
ALTER TABLE "activity_questions" ADD COLUMN     "alternative_orders" JSONB,
ADD COLUMN     "sentence_text" TEXT;

-- CreateTable
CREATE TABLE "activity_ordering_submissions" (
    "attempt_id" UUID NOT NULL,
    "version_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "request_id" UUID NOT NULL,
    "segment_ids" UUID[],
    "correct" BOOLEAN NOT NULL,
    "answered_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_ordering_submissions_pkey" PRIMARY KEY ("attempt_id","question_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "activity_ordering_submissions_attempt_id_request_id_key" ON "activity_ordering_submissions"("attempt_id", "request_id");

-- AddForeignKey
ALTER TABLE "activity_ordering_submissions" ADD CONSTRAINT "activity_ordering_submissions_attempt_id_version_id_fkey" FOREIGN KEY ("attempt_id", "version_id") REFERENCES "activity_attempts"("id", "version_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_ordering_submissions" ADD CONSTRAINT "activity_ordering_submissions_question_id_version_id_fkey" FOREIGN KEY ("question_id", "version_id") REFERENCES "activity_questions"("id", "version_id") ON DELETE RESTRICT ON UPDATE CASCADE;


COMMIT;
