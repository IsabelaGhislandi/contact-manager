/*
  Warnings:

  - Made the column `address` on table `Contact` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Contact" ALTER COLUMN "address" SET NOT NULL;
