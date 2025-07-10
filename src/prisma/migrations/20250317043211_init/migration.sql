/*
  Warnings:

  - You are about to drop the column `pendingTeamcodeId` on the `tempcodes` table. All the data in the column will be lost.
  - You are about to drop the column `teamcodeId` on the `tempcodes` table. All the data in the column will be lost.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "tempcodes" DROP CONSTRAINT "tempcodes_pendingTeamcodeId_fkey";

-- DropForeignKey
ALTER TABLE "tempcodes" DROP CONSTRAINT "tempcodes_teamcodeId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tempcodes" DROP COLUMN "pendingTeamcodeId",
DROP COLUMN "teamcodeId",
ADD COLUMN     "pendingteamcodeid" INTEGER,
ADD COLUMN     "teamcodeid" INTEGER;

-- AddForeignKey
ALTER TABLE "tempcodes" ADD CONSTRAINT "tempcodes_teamcodeid_fkey" FOREIGN KEY ("teamcodeid") REFERENCES "Teamcode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tempcodes" ADD CONSTRAINT "tempcodes_pendingteamcodeid_fkey" FOREIGN KEY ("pendingteamcodeid") REFERENCES "Teamcode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
