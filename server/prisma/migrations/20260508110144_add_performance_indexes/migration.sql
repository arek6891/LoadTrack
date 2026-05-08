-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "Loading_vehicleRegistration_idx" ON "Loading"("vehicleRegistration");

-- CreateIndex
CREATE INDEX "Loading_createdAt_idx" ON "Loading"("createdAt");

-- CreateIndex
CREATE INDEX "Package_createdAt_idx" ON "Package"("createdAt");

-- CreateIndex
CREATE INDEX "Pallet_createdAt_idx" ON "Pallet"("createdAt");
