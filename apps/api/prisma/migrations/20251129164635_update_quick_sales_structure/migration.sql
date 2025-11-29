/*
  Warnings:

  - You are about to drop the column `price` on the `QuickSale` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `QuickSale` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `QuickSale` table. All the data in the column will be lost.

*/

-- Create the new QuickSaleItem table first
CREATE TABLE "QuickSaleItem" (
    "id" TEXT NOT NULL,
    "quickSaleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "QuickSaleItem_pkey" PRIMARY KEY ("id")
);

-- Add the total column first with a default value
ALTER TABLE "QuickSale" ADD COLUMN "total" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Update total field based on existing data
UPDATE "QuickSale" 
SET "total" = "quantity" * "price"
WHERE "quantity" IS NOT NULL AND "price" IS NOT NULL;

-- Migrate existing data from QuickSale to QuickSaleItem
INSERT INTO "QuickSaleItem" (id, "quickSaleId", "productId", quantity, price)
SELECT 
    gen_random_uuid() as id,
    id as "quickSaleId",
    "productId",
    "quantity",
    "price"
FROM "QuickSale"
WHERE "productId" IS NOT NULL AND "quantity" IS NOT NULL AND "price" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "QuickSale" DROP CONSTRAINT "QuickSale_productId_fkey";

-- AlterTable
ALTER TABLE "QuickSale" DROP COLUMN "price",
DROP COLUMN "productId",
DROP COLUMN "quantity";

-- AddForeignKey for QuickSaleItem
ALTER TABLE "QuickSaleItem" ADD CONSTRAINT "QuickSaleItem_quickSaleId_fkey" FOREIGN KEY ("quickSaleId") REFERENCES "QuickSale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey for QuickSaleItem
ALTER TABLE "QuickSaleItem" ADD CONSTRAINT "QuickSaleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
