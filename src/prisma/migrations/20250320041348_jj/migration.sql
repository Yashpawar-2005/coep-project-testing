/*
  Warnings:

  - You are about to drop the column `mainteamcodeid` on the `tempcodes` table. All the data in the column will be lost.
  - Added the required column `ispending` to the `tempcodes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "tempcodes" DROP CONSTRAINT "tempcodes_mainteamcodeid_fkey";

-- AlterTable
ALTER TABLE "tempcodes" DROP COLUMN "mainteamcodeid",
ADD COLUMN     "ispending" BOOLEAN NOT NULL;
