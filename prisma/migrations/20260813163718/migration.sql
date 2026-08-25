-- CreateTable
CREATE TABLE "Produto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "codigoOEM" TEXT,
    "codigoBarras" TEXT,
    "ncm" TEXT,
    "cest" TEXT,
    "referenciaCruzada" TEXT,
    "marca" TEXT NOT NULL,
    "fabricanteOriginal" TEXT,
    "paisOrigem" TEXT,
    "tipoAplicacao" TEXT NOT NULL,
    "tipoPeca" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "subcategoria" TEXT,
    "tags" TEXT,
    "localizacaoEstoque" TEXT,
    "setorAlmoxarifado" TEXT,
    "pesoBruto" REAL,
    "pesoLiquido" REAL,
    "comprimento" REAL,
    "largura" REAL,
    "altura" REAL,
    "unidadeMedida" TEXT,
    "conteudoEmbalagem" INTEGER,
    "material" TEXT,
    "cor" TEXT,
    "garantia" TEXT,
    "fichaTecnicaUrl" TEXT,
    "manualUrl" TEXT,
    "custoAquisicao" REAL,
    "freteEntrada" REAL,
    "impostosEntrada" REAL,
    "custoTotal" REAL NOT NULL DEFAULT 0,
    "margemLucro" REAL,
    "precoVendaSugerido" REAL,
    "precoVendaBalcao" REAL,
    "precoB2B" REAL,
    "precoMinimo" REAL,
    "descontoMaximo" REAL,
    "precoSite" REAL,
    "precoPromocional" REAL,
    "dataInicioPromocao" DATETIME,
    "dataFimPromocao" DATETIME,
    "exibirNoSite" BOOLEAN NOT NULL DEFAULT false,
    "destaqueHome" BOOLEAN NOT NULL DEFAULT false,
    "aliquotaICMS" REAL,
    "aliquotaIPI" REAL,
    "cstCsosn" TEXT,
    "pisCofins" REAL,
    "regimeTributacao" TEXT,
    "estoqueAtual" INTEGER NOT NULL DEFAULT 0,
    "estoqueMinimo" INTEGER,
    "estoqueMaximo" INTEGER,
    "estoqueSeguranca" INTEGER,
    "controlaEstoque" BOOLEAN NOT NULL DEFAULT true,
    "permiteVendaSemEstoque" BOOLEAN NOT NULL DEFAULT false,
    "fornecedorPadraoId" TEXT,
    "prazoReposicao" INTEGER,
    "fotos" TEXT,
    "imagemPrincipal" TEXT,
    "descricaoCurta" TEXT,
    "descricaoCompleta" TEXT,
    "caracteristicas" TEXT,
    "videoUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "VeiculoCompativel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "produtoId" TEXT NOT NULL,
    "montadora" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "versaoMotor" TEXT NOT NULL,
    "anoInicial" INTEGER NOT NULL,
    "anoFinal" INTEGER,
    "posicao" TEXT NOT NULL,
    "observacao" TEXT,
    CONSTRAINT "VeiculoCompativel_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Fornecedor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "razaoSocial" TEXT NOT NULL,
    "nomeFantasia" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "inscricaoEstadual" TEXT,
    "contato" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "enderecoLogradouro" TEXT NOT NULL,
    "enderecoNumero" TEXT NOT NULL,
    "enderecoComplemento" TEXT,
    "enderecoBairro" TEXT NOT NULL,
    "enderecoCidade" TEXT NOT NULL,
    "enderecoEstado" TEXT NOT NULL,
    "enderecoCep" TEXT NOT NULL,
    "dadosBancariosBanco" TEXT NOT NULL,
    "dadosBancariosAgencia" TEXT NOT NULL,
    "dadosBancariosConta" TEXT NOT NULL,
    "dadosBancariosTipoConta" TEXT NOT NULL,
    "condicaoPagamentoPadrao" TEXT,
    "prazoEntrega" INTEGER,
    "avaliacao" INTEGER,
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "gastos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "dataVencimento" DATETIME NOT NULL,
    "dataPagamento" DATETIME,
    "formaPagamento" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "recorrente" BOOLEAN NOT NULL DEFAULT false,
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Funcionario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "setor" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "dataAdmissao" DATETIME NOT NULL,
    "dataDemissao" DATETIME,
    "salario" REAL,
    "comissaoPercentual" REAL DEFAULT 0,
    "tipoContrato" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "endereco" TEXT,
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SaidaEstoque" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipoSaida" TEXT NOT NULL,
    "numeroPedido" TEXT,
    "dataHora" DATETIME NOT NULL,
    "cliente" TEXT,
    "cpfCnpjCliente" TEXT,
    "vendedor" TEXT,
    "subtotal" REAL,
    "descontoTotal" REAL,
    "valorFinal" REAL,
    "formasPagamento" TEXT,
    "troco" REAL,
    "observacoes" TEXT,
    "emitirNFe" BOOLEAN,
    "imprimirCupom" BOOLEAN,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "EntradaEstoque" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numeroNF" TEXT NOT NULL,
    "chaveAcesso" TEXT NOT NULL,
    "dataEmissao" DATETIME NOT NULL,
    "dataEntrada" DATETIME NOT NULL,
    "fornecedorId" TEXT NOT NULL,
    "cnpjFornecedor" TEXT NOT NULL,
    "tipoEntrada" TEXT NOT NULL,
    "condicaoPagamento" TEXT,
    "dataVencimento" DATETIME,
    "formaPagamento" TEXT,
    "subtotalProdutos" REAL,
    "totalDescontos" REAL,
    "totalFrete" REAL,
    "totalIPI" REAL,
    "totalICMSST" REAL,
    "outrasDespesas" REAL,
    "valorTotal" REAL,
    "observacoes" TEXT,
    "anexoUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EntradaEstoque_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ItemMovimentacao_saida" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "produtoId" TEXT NOT NULL,
    "saidaId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "unidade" TEXT,
    "valorUnitario" REAL NOT NULL,
    "desconto" REAL,
    "ipi" REAL,
    "icms" REAL,
    "valorTotal" REAL NOT NULL,
    CONSTRAINT "ItemMovimentacao_saida_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ItemMovimentacao_saida_saidaId_fkey" FOREIGN KEY ("saidaId") REFERENCES "SaidaEstoque" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ItemMovimentacao_entrada" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "produtoId" TEXT NOT NULL,
    "entradaId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "unidade" TEXT,
    "valorUnitario" REAL NOT NULL,
    "desconto" REAL,
    "ipi" REAL,
    "icms" REAL,
    "valorTotal" REAL NOT NULL,
    CONSTRAINT "ItemMovimentacao_entrada_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ItemMovimentacao_entrada_entradaId_fkey" FOREIGN KEY ("entradaId") REFERENCES "EntradaEstoque" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Produto_slug_key" ON "Produto"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Produto_sku_key" ON "Produto"("sku");

-- CreateIndex
CREATE INDEX "Produto_categoria_idx" ON "Produto"("categoria");

-- CreateIndex
CREATE INDEX "VeiculoCompativel_produtoId_idx" ON "VeiculoCompativel"("produtoId");

-- CreateIndex
CREATE UNIQUE INDEX "Fornecedor_cnpj_key" ON "Fornecedor"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Funcionario_cpf_key" ON "Funcionario"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "EntradaEstoque_chaveAcesso_key" ON "EntradaEstoque"("chaveAcesso");

-- CreateIndex
CREATE INDEX "ItemMovimentacao_saida_produtoId_idx" ON "ItemMovimentacao_saida"("produtoId");

-- CreateIndex
CREATE INDEX "ItemMovimentacao_saida_saidaId_idx" ON "ItemMovimentacao_saida"("saidaId");

-- CreateIndex
CREATE INDEX "ItemMovimentacao_entrada_produtoId_idx" ON "ItemMovimentacao_entrada"("produtoId");

-- CreateIndex
CREATE INDEX "ItemMovimentacao_entrada_entradaId_idx" ON "ItemMovimentacao_entrada"("entradaId");
