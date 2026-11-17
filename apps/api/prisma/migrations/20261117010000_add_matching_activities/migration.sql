BEGIN;
-- AlterEnum
ALTER TYPE "ActivityType" ADD VALUE 'MATCHING';

-- CreateTable
CREATE TABLE "activity_matching_pairs" (
    "id" UUID NOT NULL,
    "version_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "term" VARCHAR(200) NOT NULL,
    "translation" VARCHAR(255) NOT NULL,
    "feedback" TEXT NOT NULL,
    "variant" TEXT,
    "vocabulary_id" UUID,

    CONSTRAINT "activity_matching_pairs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_matching_submissions" (
    "attempt_id" UUID NOT NULL,
    "version_id" UUID NOT NULL,
    "request_id" UUID NOT NULL,
    "term_id" UUID NOT NULL,
    "translation_id" UUID NOT NULL,
    "sequence" INTEGER NOT NULL,
    "correct" BOOLEAN NOT NULL,

    CONSTRAINT "activity_matching_submissions_pkey" PRIMARY KEY ("attempt_id","request_id")
);

-- CreateIndex
CREATE INDEX "activity_matching_pairs_vocabulary_id_idx" ON "activity_matching_pairs"("vocabulary_id");

-- CreateIndex
CREATE UNIQUE INDEX "activity_matching_pairs_id_version_id_key" ON "activity_matching_pairs"("id", "version_id");

-- CreateIndex
CREATE UNIQUE INDEX "activity_matching_pairs_version_id_position_key" ON "activity_matching_pairs"("version_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "activity_matching_submissions_attempt_id_sequence_key" ON "activity_matching_submissions"("attempt_id", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "matching_completed_pair_key" ON "activity_matching_submissions"("attempt_id", "term_id") WHERE ("correct" = true);

-- AddForeignKey
ALTER TABLE "activity_matching_pairs" ADD CONSTRAINT "activity_matching_pairs_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "activity_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_matching_pairs" ADD CONSTRAINT "activity_matching_pairs_vocabulary_id_fkey" FOREIGN KEY ("vocabulary_id") REFERENCES "vocabulary_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_matching_submissions" ADD CONSTRAINT "activity_matching_submissions_attempt_id_version_id_fkey" FOREIGN KEY ("attempt_id", "version_id") REFERENCES "activity_attempts"("id", "version_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_matching_submissions" ADD CONSTRAINT "activity_matching_submissions_term_id_version_id_fkey" FOREIGN KEY ("term_id", "version_id") REFERENCES "activity_matching_pairs"("id", "version_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_matching_submissions" ADD CONSTRAINT "activity_matching_submissions_translation_id_version_id_fkey" FOREIGN KEY ("translation_id", "version_id") REFERENCES "activity_matching_pairs"("id", "version_id") ON DELETE RESTRICT ON UPDATE CASCADE;


ALTER TABLE activity_matching_submissions ADD CONSTRAINT matching_outcome_check CHECK (correct = (term_id = translation_id));
COMMIT;
