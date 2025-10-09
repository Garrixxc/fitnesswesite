/*
  Warnings:

  - You are about to drop the column `addressJson` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `brochureUrl` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `requireApproval` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Event" DROP COLUMN "addressJson",
DROP COLUMN "brochureUrl",
DROP COLUMN "requireApproval";
