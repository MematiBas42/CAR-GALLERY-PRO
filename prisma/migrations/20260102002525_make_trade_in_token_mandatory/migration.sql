/*
  Warnings:

  - Made the column `token` on table `trade_in_requests` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "trade_in_requests" ALTER COLUMN "token" SET NOT NULL;
