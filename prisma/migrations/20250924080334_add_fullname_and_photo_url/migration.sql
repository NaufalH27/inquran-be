/*
  Warnings:

  - A unique constraint covering the columns `[photo_url]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `photo_url` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_photo_url_key` ON `User`(`photo_url`);
