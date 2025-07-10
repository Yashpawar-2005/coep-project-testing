/*
  Warnings:

  - You are about to drop the column `discription` on the `Team` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Team" DROP COLUMN "discription",
ADD COLUMN     "description" TEXT;

-- CreateTable
CREATE TABLE "Maincode" (
    "id" SERIAL NOT NULL,
    "code" JSONB NOT NULL,
    "teamcodeId" INTEGER NOT NULL,

    CONSTRAINT "Maincode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Maincode_teamcodeId_key" ON "Maincode"("teamcodeId");

-- AddForeignKey
ALTER TABLE "Maincode" ADD CONSTRAINT "Maincode_teamcodeId_fkey" FOREIGN KEY ("teamcodeId") REFERENCES "Teamcode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
