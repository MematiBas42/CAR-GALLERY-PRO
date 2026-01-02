-- AlterTable
ALTER TABLE "classifieds" ADD COLUMN     "latest_arrival_order" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "index_latest_arrival_order" ON "classifieds"("latest_arrival_order");
