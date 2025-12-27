-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "source_id" TEXT;

-- CreateIndex
CREATE INDEX "index_customer_source_id" ON "customers"("source_id");
