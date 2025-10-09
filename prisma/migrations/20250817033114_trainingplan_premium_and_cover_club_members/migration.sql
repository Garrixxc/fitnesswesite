/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `TrainingPlan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `TrainingPlan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Club" ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "logoUrl" TEXT;

-- AlterTable
ALTER TABLE "public"."TrainingPlan" ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "isPremium" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slug" TEXT NOT NULL;

-- Backfill slug for existing training plans (Postgres)
UPDATE "TrainingPlan"
SET "slug" = LOWER(regexp_replace(COALESCE(NULLIF("title", ''), 'plan'), '\s+', '-', 'g'))
             || '-' || SUBSTRING(MD5("id") FROM 1 FOR 4)
WHERE "slug" IS NULL OR "slug" = '';

-- CreateIndex
CREATE UNIQUE INDEX "TrainingPlan_slug_key" ON "public"."TrainingPlan"("slug");


