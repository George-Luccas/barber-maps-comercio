-- AlterTable
ALTER TABLE "Barbershop" ADD COLUMN     "closingTime" TEXT,
ADD COLUMN     "lunchEnd" TEXT,
ADD COLUMN     "lunchStart" TEXT,
ADD COLUMN     "openingTime" TEXT,
ALTER COLUMN "imageUrl" DROP NOT NULL;
