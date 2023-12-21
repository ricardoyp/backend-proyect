/*
  Warnings:

  - You are about to drop the column `Location` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `body` on the `Post` table. All the data in the column will be lost.
  - Added the required column `locationId` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "Location",
DROP COLUMN "body",
ADD COLUMN     "locationId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "latitud" DOUBLE PRECISION NOT NULL,
    "longitud" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
