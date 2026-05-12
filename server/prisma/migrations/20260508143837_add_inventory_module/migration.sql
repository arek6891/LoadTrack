-- CreateEnum
CREATE TYPE "InventoryStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateTable
CREATE TABLE "InventorySession" (
    "id" TEXT NOT NULL,
    "status" "InventoryStatus" NOT NULL DEFAULT 'OPEN',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "InventorySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryCount" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "palletNumber" TEXT NOT NULL,
    "locationName" TEXT NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDiscrepancy" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "InventoryCount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InventorySession_status_idx" ON "InventorySession"("status");

-- CreateIndex
CREATE INDEX "InventoryCount_sessionId_idx" ON "InventoryCount"("sessionId");

-- CreateIndex
CREATE INDEX "InventoryCount_palletNumber_idx" ON "InventoryCount"("palletNumber");

-- AddForeignKey
ALTER TABLE "InventoryCount" ADD CONSTRAINT "InventoryCount_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InventorySession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
