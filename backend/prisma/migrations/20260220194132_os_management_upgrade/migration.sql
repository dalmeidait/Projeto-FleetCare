-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- AlterEnum
ALTER TYPE "OsStatus" ADD VALUE 'WAITING_APPROVAL';

-- AlterTable
ALTER TABLE "WorkOrder" ADD COLUMN     "cause" TEXT,
ADD COLUMN     "diagnostic" TEXT,
ADD COLUMN     "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "grandTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "laborTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "mileage" INTEGER,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "partsTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'NORMAL';

-- CreateTable
CREATE TABLE "OsService" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "estimatedTime" DOUBLE PRECISION,
    "realTime" DOUBLE PRECISION,
    "price" DOUBLE PRECISION NOT NULL,
    "workOrderId" TEXT NOT NULL,

    CONSTRAINT "OsService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OsPart" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "origin" TEXT,
    "workOrderId" TEXT NOT NULL,

    CONSTRAINT "OsPart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OsHistory" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "workOrderId" TEXT NOT NULL,

    CONSTRAINT "OsHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OsService" ADD CONSTRAINT "OsService_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OsPart" ADD CONSTRAINT "OsPart_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OsHistory" ADD CONSTRAINT "OsHistory_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
