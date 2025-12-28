-- CreateIndex
CREATE INDEX "classifieds_title_idx" ON "classifieds"("title");

-- CreateIndex
CREATE INDEX "classifieds_vrm_idx" ON "classifieds"("vrm");

-- CreateIndex
CREATE INDEX "index_status_created_at" ON "classifieds"("status", "created_at");

-- CreateIndex
CREATE INDEX "index_status_latest_arrival" ON "classifieds"("status", "is_latest_arrival");

-- CreateIndex
CREATE INDEX "index_customer_email" ON "customers"("email");

-- CreateIndex
CREATE INDEX "index_customer_status" ON "customers"("status");
