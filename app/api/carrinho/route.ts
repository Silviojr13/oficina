import { NextResponse } from 'next/server';
import { carrinhoMock } from '@/lib/mock-data';

export async function GET(request: Request) {
  // Simula um pequeno atraso para demonstrar carregamento
  await new Promise(resolve => setTimeout(resolve, 200));

  return NextResponse.json({
    produtos: carrinhoMock,
    total: carrinhoMock.reduce((acc, item) => acc + (item.produto.precoSite * item.quantidade), 0)
  });
}