BEGIN;
-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('MULTIPLE_CHOICE');

-- CreateTable
CREATE TABLE "activities" (
    "id" UUID NOT NULL,
    "lesson_id" UUID NOT NULL,
    "type" "ActivityType" NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT false,
    "revision" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_versions" (
    "id" UUID NOT NULL,
    "activity_id" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "instructions" TEXT NOT NULL,

    CONSTRAINT "activity_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_questions" (
    "id" UUID NOT NULL,
    "version_id" UUID NOT NULL,
    "prompt" TEXT NOT NULL,
    "feedback" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "correct_position" INTEGER NOT NULL,
    "vocabulary_id" UUID,
    "term_snapshot" TEXT,

    CONSTRAINT "activity_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_options" (
    "id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "activity_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_attempts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "version_id" UUID NOT NULL,
    "request_id" UUID NOT NULL,
    "started_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(3),

    CONSTRAINT "activity_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_answers" (
    "attempt_id" UUID NOT NULL,
    "version_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "option_id" UUID NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "answered_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_answers_pkey" PRIMARY KEY ("attempt_id","question_id")
);

-- CreateIndex
CREATE INDEX "activities_lesson_id_position_idx" ON "activities"("lesson_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "activity_versions_activity_id_number_key" ON "activity_versions"("activity_id", "number");

-- CreateIndex
CREATE UNIQUE INDEX "activity_questions_version_id_position_key" ON "activity_questions"("version_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "activity_questions_id_version_id_key" ON "activity_questions"("id", "version_id");

-- CreateIndex
CREATE UNIQUE INDEX "activity_options_question_id_position_key" ON "activity_options"("question_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "activity_options_id_question_id_key" ON "activity_options"("id", "question_id");

-- CreateIndex
CREATE INDEX "activity_attempts_user_id_version_id_idx" ON "activity_attempts"("user_id", "version_id");

-- CreateIndex
CREATE UNIQUE INDEX "activity_attempts_user_id_request_id_key" ON "activity_attempts"("user_id", "request_id");

-- CreateIndex
CREATE UNIQUE INDEX "activity_attempts_id_version_id_key" ON "activity_attempts"("id", "version_id");

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_versions" ADD CONSTRAINT "activity_versions_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_questions" ADD CONSTRAINT "activity_questions_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "activity_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_questions" ADD CONSTRAINT "activity_questions_vocabulary_id_fkey" FOREIGN KEY ("vocabulary_id") REFERENCES "vocabulary_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_options" ADD CONSTRAINT "activity_options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "activity_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_attempts" ADD CONSTRAINT "activity_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_attempts" ADD CONSTRAINT "activity_attempts_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "activity_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_answers" ADD CONSTRAINT "activity_answers_attempt_id_version_id_fkey" FOREIGN KEY ("attempt_id", "version_id") REFERENCES "activity_attempts"("id", "version_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_answers" ADD CONSTRAINT "activity_answers_question_id_version_id_fkey" FOREIGN KEY ("question_id", "version_id") REFERENCES "activity_questions"("id", "version_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_answers" ADD CONSTRAINT "activity_answers_option_id_question_id_fkey" FOREIGN KEY ("option_id", "question_id") REFERENCES "activity_options"("id", "question_id") ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;
