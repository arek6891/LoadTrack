-- AlterTable
ALTER TABLE "Loading" ADD COLUMN     "expectedPallets" TEXT[] DEFAULT ARRAY[]::TEXT[];
