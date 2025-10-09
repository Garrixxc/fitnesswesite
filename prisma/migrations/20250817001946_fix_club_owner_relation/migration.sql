/*
  Warnings:

  - The values [PAID] on the enum `RegStatus` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `AthleteProfile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `AthleteProfile` table. All the data in the column will be lost.
  - You are about to alter the column `weightKg` on the `AthleteProfile` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to drop the column `coverImage` on the `Club` table. All the data in the column will be lost.
  - You are about to drop the column `logoUrl` on the `Club` table. All the data in the column will be lost.
  - You are about to drop the column `memberCount` on the `Club` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyRate` on the `Coach` table. All the data in the column will be lost.
  - You are about to drop the column `photoUrl` on the `Coach` table. All the data in the column will be lost.
  - You are about to drop the column `yearsExp` on the `Coach` table. All the data in the column will be lost.
  - You are about to drop the column `paymentId` on the `Registration` table. All the data in the column will be lost.
  - You are about to drop the column `stripeId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `coverImage` on the `TrainingPlan` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `TrainingPlan` table. All the data in the column will be lost.
  - You are about to drop the column `isPremium` on the `TrainingPlan` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `TrainingPlan` table. All the data in the column will be lost.
  - You are about to drop the column `dayOfWeek` on the `Workout` table. All the data in the column will be lost.
  - You are about to drop the column `trainingPlanId` on the `Workout` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Coach` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,eventId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[providerSubId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - Made the column `city` on table `Club` required. This step will fail if there are existing NULL values in that column.
  - Made the column `city` on table `Coach` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `Registration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `TrainingPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `day` to the `Workout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `planId` to the `Workout` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ExpertRole" AS ENUM ('COACH', 'PHYSIO', 'NUTRITION');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."RegStatus_new" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'WAITLISTED');
ALTER TABLE "public"."Registration" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Registration" ALTER COLUMN "status" TYPE "public"."RegStatus_new" USING ("status"::text::"public"."RegStatus_new");
ALTER TYPE "public"."RegStatus" RENAME TO "RegStatus_old";
ALTER TYPE "public"."RegStatus_new" RENAME TO "RegStatus";
DROP TYPE "public"."RegStatus_old";
ALTER TABLE "public"."Registration" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
ALTER TYPE "public"."Role" ADD VALUE 'COACH';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."SubStatus" ADD VALUE 'TRIALING';
ALTER TYPE "public"."SubStatus" ADD VALUE 'INCOMPLETE';

-- DropForeignKey
ALTER TABLE "public"."AthleteProfile" DROP CONSTRAINT "AthleteProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Event" DROP CONSTRAINT "Event_organizerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Registration" DROP CONSTRAINT "Registration_eventId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Registration" DROP CONSTRAINT "Registration_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Review" DROP CONSTRAINT "Review_eventId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Review" DROP CONSTRAINT "Review_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Subscription" DROP CONSTRAINT "Subscription_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Workout" DROP CONSTRAINT "Workout_trainingPlanId_fkey";

-- DropIndex
DROP INDEX "public"."AthleteProfile_userId_key";

-- DropIndex
DROP INDEX "public"."Event_sport_idx";

-- DropIndex
DROP INDEX "public"."Event_startDate_idx";

-- DropIndex
DROP INDEX "public"."Subscription_stripeId_key";

-- DropIndex
DROP INDEX "public"."TrainingPlan_slug_key";

-- AlterTable
ALTER TABLE "public"."AthleteProfile" DROP CONSTRAINT "AthleteProfile_pkey",
DROP COLUMN "id",
ALTER COLUMN "weightKg" SET DATA TYPE INTEGER,
ADD CONSTRAINT "AthleteProfile_pkey" PRIMARY KEY ("userId");

-- AlterTable
ALTER TABLE "public"."Club" DROP COLUMN "coverImage",
DROP COLUMN "logoUrl",
DROP COLUMN "memberCount",
ADD COLUMN     "members" INTEGER,
ADD COLUMN     "ownerId" TEXT,
ALTER COLUMN "city" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Coach" DROP COLUMN "monthlyRate",
DROP COLUMN "photoUrl",
DROP COLUMN "yearsExp",
ADD COLUMN     "rate" INTEGER,
ADD COLUMN     "userId" TEXT,
ALTER COLUMN "city" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Event" ADD COLUMN     "requireApproval" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "organizerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Registration" DROP COLUMN "paymentId",
ADD COLUMN     "paymentRef" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "public"."Review" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Subscription" DROP COLUMN "stripeId",
ADD COLUMN     "provider" TEXT,
ADD COLUMN     "providerSubId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'ACTIVE',
ALTER COLUMN "currentPeriodEnd" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."TrainingPlan" DROP COLUMN "coverImage",
DROP COLUMN "currency",
DROP COLUMN "isPremium",
DROP COLUMN "slug",
ADD COLUMN     "compareAt" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Workout" DROP COLUMN "dayOfWeek",
DROP COLUMN "trainingPlanId",
ADD COLUMN     "day" INTEGER NOT NULL,
ADD COLUMN     "distanceKm" DOUBLE PRECISION,
ADD COLUMN     "durationMin" INTEGER,
ADD COLUMN     "planId" TEXT NOT NULL,
ALTER COLUMN "details" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."Expert" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "role" "public"."ExpertRole" NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "sports" "public"."Sport"[],
    "bio" TEXT,
    "rating" DOUBLE PRECISION,
    "rate" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Expert_slug_key" ON "public"."Expert"("slug");

-- CreateIndex
CREATE INDEX "Expert_role_idx" ON "public"."Expert"("role");

-- CreateIndex
CREATE INDEX "Expert_city_idx" ON "public"."Expert"("city");

-- CreateIndex
CREATE INDEX "AthleteProfile_city_idx" ON "public"."AthleteProfile"("city");

-- CreateIndex
CREATE INDEX "Club_city_idx" ON "public"."Club"("city");

-- CreateIndex
CREATE UNIQUE INDEX "Coach_userId_key" ON "public"."Coach"("userId");

-- CreateIndex
CREATE INDEX "Coach_city_idx" ON "public"."Coach"("city");

-- CreateIndex
CREATE INDEX "Event_sport_startDate_idx" ON "public"."Event"("sport", "startDate");

-- CreateIndex
CREATE INDEX "Event_location_idx" ON "public"."Event"("location");

-- CreateIndex
CREATE INDEX "Event_organizerId_idx" ON "public"."Event"("organizerId");

-- CreateIndex
CREATE INDEX "Registration_status_idx" ON "public"."Registration"("status");

-- CreateIndex
CREATE INDEX "Review_eventId_idx" ON "public"."Review"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_eventId_key" ON "public"."Review"("userId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_providerSubId_key" ON "public"."Subscription"("providerSubId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "public"."Subscription"("status");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "public"."User"("role");

-- CreateIndex
CREATE INDEX "Workout_planId_week_day_idx" ON "public"."Workout"("planId", "week", "day");

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Registration" ADD CONSTRAINT "Registration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Registration" ADD CONSTRAINT "Registration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Workout" ADD CONSTRAINT "Workout_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."TrainingPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AthleteProfile" ADD CONSTRAINT "AthleteProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Coach" ADD CONSTRAINT "Coach_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Club" ADD CONSTRAINT "Club_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
