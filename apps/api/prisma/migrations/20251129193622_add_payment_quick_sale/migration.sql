-- CreateTable
CREATE TABLE "QuickSalePayment" (
    "id" TEXT NOT NULL,
    "quickSaleId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "method" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "QuickSalePayment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuickSalePayment" ADD CONSTRAINT "QuickSalePayment_quickSaleId_fkey" FOREIGN KEY ("quickSaleId") REFERENCES "QuickSale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
