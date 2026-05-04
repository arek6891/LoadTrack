-- CreateEnum
CREATE TYPE "TemplateType" AS ENUM ('PACKAGE', 'PALLET');

-- CreateTable
CREATE TABLE "LabelTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TemplateType" NOT NULL DEFAULT 'PACKAGE',
    "htmlContent" TEXT NOT NULL,
    "cssContent" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabelTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LabelTemplate_name_key" ON "LabelTemplate"("name");
