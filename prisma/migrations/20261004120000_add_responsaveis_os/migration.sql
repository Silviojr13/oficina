-- CreateTable
CREATE TABLE "ResponsavelOS" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ordemServicoId" TEXT NOT NULL,
    "funcionarioId" TEXT,
    "nome" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ResponsavelOS_ordemServicoId_fkey" FOREIGN KEY ("ordemServicoId") REFERENCES "OrdemServico" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ResponsavelOS_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "Funcionario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ResponsavelOS_ordemServicoId_idx" ON "ResponsavelOS"("ordemServicoId");

-- CreateIndex
CREATE INDEX "ResponsavelOS_funcionarioId_idx" ON "ResponsavelOS"("funcionarioId");

-- Migra o historico: cada OS que ja tinha um mecanico digitado a mao vira uma
-- linha aqui, ligada ao cadastro de Funcionario quando o nome bate exatamente
-- (ignorando maiusculas/minusculas e espacos nas pontas).
INSERT INTO "ResponsavelOS" ("id", "ordemServicoId", "funcionarioId", "nome", "createdAt")
SELECT
    lower(hex(randomblob(16))),
    os."id",
    (SELECT f."id" FROM "Funcionario" f WHERE lower(trim(f."nome")) = lower(trim(os."mecanicoResponsavel")) LIMIT 1),
    trim(os."mecanicoResponsavel"),
    CURRENT_TIMESTAMP
FROM "OrdemServico" os
WHERE os."mecanicoResponsavel" IS NOT NULL AND trim(os."mecanicoResponsavel") <> '';
