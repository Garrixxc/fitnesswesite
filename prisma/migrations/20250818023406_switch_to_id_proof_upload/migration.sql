/*
  Warnings:

  - You are about to drop the column `aadhaarLast4` on the `AthleteProfile` table. All the data in the column will be lost.
  - You are about to drop the column `aadhaarProviderRef` on the `AthleteProfile` table. All the data in the column will be lost.
  - You are about to drop the column `aadhaarStatus` on the `AthleteProfile` table. All the data in the column will be lost.
  - You are about to drop the column `aadhaarVerifiedAt` on the `AthleteProfile` table. All the data in the column will be lost.
  - You are about to drop the `KycVerification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OtpRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."KycVerification" DROP CONSTRAINT "KycVerification_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OtpRequest" DROP CONSTRAINT "OtpRequest_userId_fkey";

-- DropIndex
DROP INDEX "public"."AthleteProfile_aadhaarProviderRef_key";

-- AlterTable
ALTER TABLE "public"."AthleteProfile" DROP COLUMN "aadhaarLast4",
DROP COLUMN "aadhaarProviderRef",
DROP COLUMN "aadhaarStatus",
DROP COLUMN "aadhaarVerifiedAt",
ADD COLUMN     "idProofFilePath" TEXT,
ADD COLUMN     "idProofType" TEXT,
ADD COLUMN     "idProofVerifiedAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "public"."KycVerification";

-- DropTable
DROP TABLE "public"."OtpRequest";

-- DropEnum
DROP TYPE "public"."AadhaarStatus";

-- DropEnum
DROP TYPE "public"."KycStatus";

-- DropEnum
DROP TYPE "public"."KycType";

-- DropEnum
DROP TYPE "public"."OtpPurpose";

-- DropEnum
DROP TYPE "public"."OtpStatus";
