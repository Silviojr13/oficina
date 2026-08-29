-- CreateTable
CREATE TABLE "OrdemServico" (
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
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ItemOrdemServico" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ordemServicoId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "valorUnitario" REAL NOT NULL,
    "valorTotal" REAL NOT NULL,
    CONSTRAINT "ItemOrdemServico_ordemServicoId_fkey" FOREIGN KEY ("ordemServicoId") REFERENCES "OrdemServico" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ItemOrdemServico_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "OrdemServico_numero_key" ON "OrdemServico"("numero");

-- CreateIndex
CREATE INDEX "OrdemServico_placa_idx" ON "OrdemServico"("placa");

-- CreateIndex
CREATE INDEX "OrdemServico_status_idx" ON "OrdemServico"("status");

-- CreateIndex
CREATE INDEX "ItemOrdemServico_ordemServicoId_idx" ON "ItemOrdemServico"("ordemServicoId");

-- CreateIndex
CREATE INDEX "ItemOrdemServico_produtoId_idx" ON "ItemOrdemServico"("produtoId");
