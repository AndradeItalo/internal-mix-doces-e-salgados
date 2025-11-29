-- AddForeignKey
ALTER TABLE "QuickSale" ADD CONSTRAINT "QuickSale_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
