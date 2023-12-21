/*
  Warnings:

  - You are about to drop the column `latitud` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `longitud` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `Location` table. All the data in the column will be lost.
  - Added the required column `latitude` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Location` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Location" DROP COLUMN "latitud",
DROP COLUMN "longitud",
DROP COLUMN "nombre",
ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;
