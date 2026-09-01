-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "cpfCnpj" TEXT,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Veiculo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "marca" TEXT,
    "modelo" TEXT,
    "ano" INTEGER,
    "cor" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Veiculo_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OrdemServico" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "veiculoMarca" TEXT,
    "veiculoModelo" TEXT,
    "veiculoAno" INTEGER,
    "veiculoCor" TEXT,
    "kmEntrada" INTEGER NOT NULL,
    "clienteNome" TEXT NOT NULL,
    "clienteTelefone" TEXT,
    "clienteCpfCnpj" TEXT,
    "clienteId" TEXT,
    "veiculoId" TEXT,
    "mecanicoResponsavel" TEXT,
    "dataEntrada" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataPrevisaoEntrega" DATETIME,
    "dataSaida" DATETIME,
    "problemaRelatado" TEXT,
    "diagnostico" TEXT,
    "codigoFalha" TEXT,
    "sistemaAfetado" TEXT,
    "servicosRealizados" TEXT,
    "status" TEXT NOT NULL DEFAULT 'aberto',
    "valorMaoDeObra" REAL NOT NULL DEFAULT 0,
    "valorPecas" REAL NOT NULL DEFAULT 0,
    "desconto" REAL NOT NULL DEFAULT 0,
    "valorTotal" REAL NOT NULL DEFAULT 0,
    "formaPagamento" TEXT,
    "garantiaDias" INTEGER,
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OrdemServico_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "OrdemServico_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "Veiculo" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_OrdemServico" ("clienteCpfCnpj", "clienteNome", "clienteTelefone", "codigoFalha", "createdAt", "dataEntrada", "dataPrevisaoEntrega", "dataSaida", "desconto", "diagnostico", "formaPagamento", "garantiaDias", "id", "kmEntrada", "mecanicoResponsavel", "numero", "observacoes", "placa", "problemaRelatado", "servicosRealizados", "sistemaAfetado", "status", "updatedAt", "valorMaoDeObra", "valorPecas", "valorTotal", "veiculoAno", "veiculoCor", "veiculoMarca", "veiculoModelo") SELECT "clienteCpfCnpj", "clienteNome", "clienteTelefone", "codigoFalha", "createdAt", "dataEntrada", "dataPrevisaoEntrega", "dataSaida", "desconto", "diagnostico", "formaPagamento", "garantiaDias", "id", "kmEntrada", "mecanicoResponsavel", "numero", "observacoes", "placa", "problemaRelatado", "servicosRealizados", "sistemaAfetado", "status", "updatedAt", "valorMaoDeObra", "valorPecas", "valorTotal", "veiculoAno", "veiculoCor", "veiculoMarca", "veiculoModelo" FROM "OrdemServico";
DROP TABLE "OrdemServico";
ALTER TABLE "new_OrdemServico" RENAME TO "OrdemServico";
CREATE UNIQUE INDEX "OrdemServico_numero_key" ON "OrdemServico"("numero");
CREATE INDEX "OrdemServico_placa_idx" ON "OrdemServico"("placa");
CREATE INDEX "OrdemServico_status_idx" ON "OrdemServico"("status");
CREATE INDEX "OrdemServico_clienteId_idx" ON "OrdemServico"("clienteId");
CREATE INDEX "OrdemServico_veiculoId_idx" ON "OrdemServico"("veiculoId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Cliente_nome_idx" ON "Cliente"("nome");

-- CreateIndex
CREATE INDEX "Cliente_telefone_idx" ON "Cliente"("telefone");

-- CreateIndex
CREATE INDEX "Veiculo_clienteId_idx" ON "Veiculo"("clienteId");

-- CreateIndex
CREATE INDEX "Veiculo_placa_idx" ON "Veiculo"("placa");
