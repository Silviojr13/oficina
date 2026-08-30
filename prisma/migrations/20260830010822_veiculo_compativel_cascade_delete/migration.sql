-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_VeiculoCompativel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "produtoId" TEXT NOT NULL,
    "montadora" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "versaoMotor" TEXT NOT NULL,
    "anoInicial" INTEGER NOT NULL,
    "anoFinal" INTEGER,
    "posicao" TEXT NOT NULL,
    "observacao" TEXT,
    CONSTRAINT "VeiculoCompativel_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_VeiculoCompativel" ("anoFinal", "anoInicial", "id", "modelo", "montadora", "observacao", "posicao", "produtoId", "versaoMotor") SELECT "anoFinal", "anoInicial", "id", "modelo", "montadora", "observacao", "posicao", "produtoId", "versaoMotor" FROM "VeiculoCompativel";
DROP TABLE "VeiculoCompativel";
ALTER TABLE "new_VeiculoCompativel" RENAME TO "VeiculoCompativel";
CREATE INDEX "VeiculoCompativel_produtoId_idx" ON "VeiculoCompativel"("produtoId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
