-- CreateEnum
CREATE TYPE "TradeInStatus" AS ENUM ('PENDING', 'REVIEWED', 'OFFERED', 'REJECTED');

-- AlterTable
ALTER TABLE "classifieds" ALTER COLUMN "currency" SET DEFAULT 'USD';

-- CreateTable
CREATE TABLE "trade_in_requests" (
    "id" SERIAL NOT NULL,
    "vin" TEXT,
    "plate" TEXT,
    "year" INTEGER,
    "make" TEXT,
    "model" TEXT,
    "trim" TEXT,
    "mileage" INTEGER,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "status" "TradeInStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trade_in_requests_pkey" PRIMARY KEY ("id")
);
