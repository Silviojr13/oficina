import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const produtosEmPromocao = await prisma.produto.findMany({
    where: {
      exibirNoSite: true,
      precoPromocional: { not: null },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(produtosEmPromocao);
}
