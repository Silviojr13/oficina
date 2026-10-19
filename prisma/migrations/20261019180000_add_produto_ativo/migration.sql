-- AlterTable: produto arquivado ("saiu de linha") em vez de excluido
ALTER TABLE "Produto" ADD COLUMN "ativo" BOOLEAN NOT NULL DEFAULT true;
