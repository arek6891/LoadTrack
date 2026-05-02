-- CreateEnum
CREATE TYPE "Status" AS ENUM ('IN_STOCK', 'LOADED', 'ERROR');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'LEADER', 'OPERATOR');

-- CreateEnum
CREATE TYPE "LoadingStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'OPERATOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Package" (
    "id" TEXT NOT NULL,
    "trackingNumber" TEXT NOT NULL,
    "palletId" TEXT,
    "locationId" TEXT,
    "status" "Status" NOT NULL DEFAULT 'IN_STOCK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pallet" (
    "id" TEXT NOT NULL,
    "palletNumber" TEXT NOT NULL,
    "locationId" TEXT,
    "loadingId" TEXT,
    "status" "Status" NOT NULL DEFAULT 'IN_STOCK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loading" (
    "id" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "vehicleRegistration" TEXT NOT NULL,
    "status" "LoadingStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "Loading_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Package_trackingNumber_key" ON "Package"("trackingNumber");

-- CreateIndex
CREATE INDEX "Package_status_idx" ON "Package"("status");

-- CreateIndex
CREATE INDEX "Package_palletId_idx" ON "Package"("palletId");

-- CreateIndex
CREATE INDEX "Package_locationId_idx" ON "Package"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "Pallet_palletNumber_key" ON "Pallet"("palletNumber");

-- CreateIndex
CREATE INDEX "Pallet_status_idx" ON "Pallet"("status");

-- CreateIndex
CREATE INDEX "Pallet_loadingId_idx" ON "Pallet"("loadingId");

-- CreateIndex
CREATE INDEX "Pallet_locationId_idx" ON "Pallet"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "Location_name_key" ON "Location"("name");

-- CreateIndex
CREATE INDEX "Loading_status_closedAt_idx" ON "Loading"("status", "closedAt");

-- CreateIndex
CREATE INDEX "Loading_driverName_idx" ON "Loading"("driverName");

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_palletId_fkey" FOREIGN KEY ("palletId") REFERENCES "Pallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pallet" ADD CONSTRAINT "Pallet_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pallet" ADD CONSTRAINT "Pallet_loadingId_fkey" FOREIGN KEY ("loadingId") REFERENCES "Loading"("id") ON DELETE SET NULL ON UPDATE CASCADE;
