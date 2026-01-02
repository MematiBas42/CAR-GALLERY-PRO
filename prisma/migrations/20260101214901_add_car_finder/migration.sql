-- CreateEnum
CREATE TYPE "FinderStatus" AS ENUM ('NEW', 'SEARCHING', 'FOUND', 'CLOSED');

-- CreateTable
CREATE TABLE "car_finder_requests" (
    "id" SERIAL NOT NULL,
    "budget" TEXT,
    "year_min" INTEGER,
    "year_max" INTEGER,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "transmission" TEXT,
    "color" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "message" TEXT,
    "status" "FinderStatus" NOT NULL DEFAULT 'NEW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "car_finder_requests_pkey" PRIMARY KEY ("id")
);
