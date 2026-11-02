/*
  Warnings:

  - You are about to drop the column `term` on the `vocabulary_items` table. All the data in the column will be lost.
  - You are about to drop the column `translation` on the `vocabulary_items` table. All the data in the column will be lost.
  - Added the required column `term_kaqchikel` to the `vocabulary_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `translation_spanish` to the `vocabulary_items` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "vocabulary_items_term_idx";

-- DropIndex
DROP INDEX "vocabulary_items_translation_idx";

-- AlterTable
ALTER TABLE "vocabulary_items" DROP COLUMN "term",
DROP COLUMN "translation",
ADD COLUMN     "term_kaqchikel" VARCHAR(200) NOT NULL,
ADD COLUMN     "translation_spanish" VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE INDEX "vocabulary_items_term_kaqchikel_idx" ON "vocabulary_items"("term_kaqchikel");

-- CreateIndex
CREATE INDEX "vocabulary_items_translation_spanish_idx" ON "vocabulary_items"("translation_spanish");
