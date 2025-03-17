-- CreateTable
CREATE TABLE "Teamcode" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,

    CONSTRAINT "Teamcode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tempcodes" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "teamcodeId" INTEGER,
    "pendingTeamcodeId" INTEGER,

    CONSTRAINT "tempcodes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Teamcode_teamId_key" ON "Teamcode"("teamId");

-- AddForeignKey
ALTER TABLE "Teamcode" ADD CONSTRAINT "Teamcode_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tempcodes" ADD CONSTRAINT "tempcodes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tempcodes" ADD CONSTRAINT "tempcodes_teamcodeId_fkey" FOREIGN KEY ("teamcodeId") REFERENCES "Teamcode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tempcodes" ADD CONSTRAINT "tempcodes_pendingTeamcodeId_fkey" FOREIGN KEY ("pendingTeamcodeId") REFERENCES "Teamcode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
