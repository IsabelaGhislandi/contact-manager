/*
  Warnings:

  - Added the required column `city` to the `Contact` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Contact" ADD COLUMN     "city" TEXT NOT NULL;
