-- Additive only: existing examples, notes, identifiers and relations remain intact.
ALTER TABLE "vocabulary_categories" ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "vocabulary_variants" ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "region" VARCHAR(150);
ALTER TABLE "vocabulary_items" ADD COLUMN "examples" JSONB,
ADD COLUMN "phonetic_guide" VARCHAR(500),
ADD COLUMN "ipa" VARCHAR(500);
