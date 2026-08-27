-- AlterTable
ALTER TABLE "Produto" ADD COLUMN "mercadoLivreErro" TEXT;
ALTER TABLE "Produto" ADD COLUMN "mercadoLivreId" TEXT;
ALTER TABLE "Produto" ADD COLUMN "mercadoLivreStatus" TEXT;
ALTER TABLE "Produto" ADD COLUMN "mercadoLivreSyncEm" DATETIME;

-- CreateTable
CREATE TABLE "MercadoLivreToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
