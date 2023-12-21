/*
  Warnings:

  - You are about to drop the column `locationId` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the `Location` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_locationId_fkey";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "locationId";

-- DropTable
DROP TABLE "Location";
