/*
  Warnings:

  - You are about to drop the column `goals` on the `AthleteProfile` table. All the data in the column will be lost.
  - You are about to drop the column `heightCm` on the `AthleteProfile` table. All the data in the column will be lost.
  - You are about to drop the column `injuries` on the `AthleteProfile` table. All the data in the column will be lost.
  - You are about to drop the column `weightKg` on the `AthleteProfile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[aadhaarProviderRef]` on the table `AthleteProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."BloodGroup" AS ENUM ('A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'O_POS', 'O_NEG', 'AB_POS', 'AB_NEG', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "public"."TshirtSize" AS ENUM ('XS', 'S', 'M', 'L', 'XL', 'XXL');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'NA');

-- CreateEnum
CREATE TYPE "public"."AadhaarStatus" AS ENUM ('NOT_SUBMITTED', 'PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."KycType" AS ENUM ('AADHAAR_OTP');

-- CreateEnum
CREATE TYPE "public"."KycStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."OtpPurpose" AS ENUM ('AADHAAR_KYC', 'LOGIN', 'PHONE_VERIFY', 'EMAIL_VERIFY');

-- CreateEnum
CREATE TYPE "public"."OtpStatus" AS ENUM ('SENT', 'VERIFIED', 'EXPIRED');

-- AlterTable
ALTER TABLE "public"."AthleteProfile" DROP COLUMN "goals",
DROP COLUMN "heightCm",
DROP COLUMN "injuries",
DROP COLUMN "weightKg",
ADD COLUMN     "aadhaarLast4" TEXT,
ADD COLUMN     "aadhaarProviderRef" TEXT,
ADD COLUMN     "aadhaarStatus" "public"."AadhaarStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
ADD COLUMN     "aadhaarVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "bloodGroup" "public"."BloodGroup" DEFAULT 'UNKNOWN',
ADD COLUMN     "country" TEXT,
ADD COLUMN     "emergencyName" TEXT,
ADD COLUMN     "emergencyPhone" TEXT,
ADD COLUMN     "gender" "public"."Gender" DEFAULT 'NA',
ADD COLUMN     "medicalConsentAt" TIMESTAMP(3),
ADD COLUMN     "medicalNotes" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "phoneVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "state" TEXT,
ADD COLUMN     "termsAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "tshirtSize" "public"."TshirtSize" DEFAULT 'M';

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."PointsLedger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointsLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OtpRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "purpose" "public"."OtpPurpose" NOT NULL,
    "codeHash" TEXT NOT NULL,
    "status" "public"."OtpStatus" NOT NULL DEFAULT 'SENT',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "OtpRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."KycVerification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."KycType" NOT NULL,
    "status" "public"."KycStatus" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "last4" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KycVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PointsLedger_userId_createdAt_idx" ON "public"."PointsLedger"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "OtpRequest_userId_purpose_status_idx" ON "public"."OtpRequest"("userId", "purpose", "status");

-- CreateIndex
CREATE INDEX "OtpRequest_destination_idx" ON "public"."OtpRequest"("destination");

-- CreateIndex
CREATE UNIQUE INDEX "KycVerification_referenceId_key" ON "public"."KycVerification"("referenceId");

-- CreateIndex
CREATE INDEX "KycVerification_userId_type_status_idx" ON "public"."KycVerification"("userId", "type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AthleteProfile_aadhaarProviderRef_key" ON "public"."AthleteProfile"("aadhaarProviderRef");

-- AddForeignKey
ALTER TABLE "public"."PointsLedger" ADD CONSTRAINT "PointsLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OtpRequest" ADD CONSTRAINT "OtpRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KycVerification" ADD CONSTRAINT "KycVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
