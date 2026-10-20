import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const produtosEmPromocao = await prisma.produto.findMany({
    where: {
      exibirNoSite: true,
      ativo: true,
      precoPromocional: { not: null },
    },
    orderBy: { createdAt: 'desc' },
    // So o que a vitrine precisa - nada de custo, margem ou dados internos.
    select: {
      id: true, nome: true, slug: true, marca: true, categoria: true, imagemPrincipal: true,
      precoSite: true, precoPromocional: true, dataInicioPromocao: true, dataFimPromocao: true, estoqueAtual: true,
    },
  });

  return NextResponse.json(produtosEmPromocao);
}
