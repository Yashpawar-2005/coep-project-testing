/*
  Warnings:

  - You are about to drop the column `teamcodeid` on the `tempcodes` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "tempcodes" DROP CONSTRAINT "tempcodes_teamcodeid_fkey";

-- AlterTable
ALTER TABLE "tempcodes" DROP COLUMN "teamcodeid",
ADD COLUMN     "mainteamcodeid" INTEGER;

-- AddForeignKey
ALTER TABLE "tempcodes" ADD CONSTRAINT "tempcodes_mainteamcodeid_fkey" FOREIGN KEY ("mainteamcodeid") REFERENCES "Teamcode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
