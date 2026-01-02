/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `trade_in_requests` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TradeInStatus" ADD VALUE 'EXPIRED';
ALTER TYPE "TradeInStatus" ADD VALUE 'COMPLETED';

-- AlterTable
ALTER TABLE "trade_in_requests" ADD COLUMN     "admin_notes" TEXT,
ADD COLUMN     "offer_expires_at" TIMESTAMP(3),
ADD COLUMN     "offered_price" INTEGER,
ADD COLUMN     "token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "trade_in_requests_token_key" ON "trade_in_requests"("token");
