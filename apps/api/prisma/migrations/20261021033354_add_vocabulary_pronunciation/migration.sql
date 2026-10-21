-- CreateTable
CREATE TABLE "vocabulary_categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(180) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "vocabulary_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocabulary_variants" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "vocabulary_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocabulary_items" (
    "id" UUID NOT NULL,
    "term" VARCHAR(200) NOT NULL,
    "translation" VARCHAR(255) NOT NULL,
    "meaning" TEXT,
    "example_kaqchikel" TEXT,
    "example_spanish" TEXT,
    "notes" TEXT,
    "category_id" UUID,
    "variant_id" UUID,
    "pronunciation_media_id" UUID,
    "image_media_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "vocabulary_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_vocabulary" (
    "id" UUID NOT NULL,
    "lesson_id" UUID NOT NULL,
    "vocabulary_id" UUID NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "lesson_vocabulary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vocabulary_categories_slug_key" ON "vocabulary_categories"("slug");

-- CreateIndex
CREATE INDEX "vocabulary_categories_name_idx" ON "vocabulary_categories"("name");

-- CreateIndex
CREATE INDEX "vocabulary_categories_created_at_idx" ON "vocabulary_categories"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "vocabulary_variants_code_key" ON "vocabulary_variants"("code");

-- CreateIndex
CREATE INDEX "vocabulary_variants_name_idx" ON "vocabulary_variants"("name");

-- CreateIndex
CREATE INDEX "vocabulary_variants_created_at_idx" ON "vocabulary_variants"("created_at");

-- CreateIndex
CREATE INDEX "vocabulary_items_term_idx" ON "vocabulary_items"("term");

-- CreateIndex
CREATE INDEX "vocabulary_items_translation_idx" ON "vocabulary_items"("translation");

-- CreateIndex
CREATE INDEX "vocabulary_items_category_id_idx" ON "vocabulary_items"("category_id");

-- CreateIndex
CREATE INDEX "vocabulary_items_variant_id_idx" ON "vocabulary_items"("variant_id");

-- CreateIndex
CREATE INDEX "vocabulary_items_pronunciation_media_id_idx" ON "vocabulary_items"("pronunciation_media_id");

-- CreateIndex
CREATE INDEX "vocabulary_items_image_media_id_idx" ON "vocabulary_items"("image_media_id");

-- CreateIndex
CREATE INDEX "vocabulary_items_is_active_idx" ON "vocabulary_items"("is_active");

-- CreateIndex
CREATE INDEX "vocabulary_items_created_at_idx" ON "vocabulary_items"("created_at");

-- CreateIndex
CREATE INDEX "lesson_vocabulary_lesson_id_idx" ON "lesson_vocabulary"("lesson_id");

-- CreateIndex
CREATE INDEX "lesson_vocabulary_vocabulary_id_idx" ON "lesson_vocabulary"("vocabulary_id");

-- CreateIndex
CREATE INDEX "lesson_vocabulary_position_idx" ON "lesson_vocabulary"("position");

-- CreateIndex
CREATE INDEX "lesson_vocabulary_is_visible_idx" ON "lesson_vocabulary"("is_visible");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_vocabulary_lesson_id_vocabulary_id_key" ON "lesson_vocabulary"("lesson_id", "vocabulary_id");

-- AddForeignKey
ALTER TABLE "vocabulary_items" ADD CONSTRAINT "vocabulary_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "vocabulary_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary_items" ADD CONSTRAINT "vocabulary_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "vocabulary_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary_items" ADD CONSTRAINT "vocabulary_items_pronunciation_media_id_fkey" FOREIGN KEY ("pronunciation_media_id") REFERENCES "media_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary_items" ADD CONSTRAINT "vocabulary_items_image_media_id_fkey" FOREIGN KEY ("image_media_id") REFERENCES "media_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_vocabulary" ADD CONSTRAINT "lesson_vocabulary_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_vocabulary" ADD CONSTRAINT "lesson_vocabulary_vocabulary_id_fkey" FOREIGN KEY ("vocabulary_id") REFERENCES "vocabulary_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
