import { NextResponse } from 'next/server';
import { produtos } from '@/lib/mock-data';

export async function GET(request: Request) {
  // Simula um pequeno atraso para demonstrar carregamento
  await new Promise(resolve => setTimeout(resolve, 200));

  // Filtra os produtos que têm um preço promocional definido (não nulo)
  const produtosEmPromocao = produtos.filter(produto => produto.precoPromocional !== null);

  return NextResponse.json(produtosEmPromocao);
}