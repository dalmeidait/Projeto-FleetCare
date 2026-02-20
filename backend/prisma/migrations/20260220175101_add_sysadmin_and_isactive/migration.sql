-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SYS_ADMIN';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
