import { NextRequest, NextResponse } from 'next/server';
import { getAuthorizationUrl } from '@/lib/mercado-livre';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // Fora de /admin/*, entao o proxy.ts nao cobre esta rota - guarda aqui direto.
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return NextResponse.redirect(new URL('/login?callbackUrl=/admin/integracoes', request.url));
  }

  try {
    return NextResponse.redirect(await getAuthorizationUrl(request.nextUrl.origin));
  } catch (error) {
    // Volta para a tela de Integracoes com a explicacao, em vez de mostrar
    // um JSON cru no navegador.
    const volta = new URL('/admin/integracoes', request.url);
    volta.searchParams.set('erro', error instanceof Error ? error.message : 'Erro desconhecido');
    return NextResponse.redirect(volta);
  }
}
