import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken } from '@/lib/mercado-livre';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const baseUrl = new URL('/admin/integracoes', request.url);

  if (!code) {
    baseUrl.searchParams.set('erro', 'Código de autorização não recebido do Mercado Livre.');
    return NextResponse.redirect(baseUrl);
  }

  try {
    await exchangeCodeForToken(code);
    baseUrl.searchParams.set('conectado', '1');
  } catch (error) {
    baseUrl.searchParams.set('erro', error instanceof Error ? error.message : 'Erro desconhecido');
  }

  return NextResponse.redirect(baseUrl);
}
