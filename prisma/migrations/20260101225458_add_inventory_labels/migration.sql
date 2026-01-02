-- AlterEnum
ALTER TYPE "ClassifiedStatus" ADD VALUE 'RESERVED';

-- AlterTable
ALTER TABLE "classifieds" ADD COLUMN     "previous_price" INTEGER;
