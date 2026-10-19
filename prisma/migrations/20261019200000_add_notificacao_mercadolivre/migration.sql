-- CreateTable
CREATE TABLE "NotificacaoMercadoLivre" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topico" TEXT NOT NULL,
    "recurso" TEXT NOT NULL,
    "processada" BOOLEAN NOT NULL DEFAULT false,
    "resultado" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "NotificacaoMercadoLivre_topico_recurso_idx" ON "NotificacaoMercadoLivre"("topico", "recurso");
