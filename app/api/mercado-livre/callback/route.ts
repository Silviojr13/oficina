import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken } from '@/lib/mercado-livre';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const baseUrl = new URL('/admin/integracoes', request.url);

  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (!code) {
    baseUrl.searchParams.set('erro', 'Código de autorização não recebido do Mercado Livre.');
    return NextResponse.redirect(baseUrl);
  }

  try {
    await exchangeCodeForToken(code, request.nextUrl.origin);
    baseUrl.searchParams.set('conectado', '1');
  } catch (error) {
    // O erro tecnico pode conter o token de acesso (ex.: erro do Prisma com
    // os dados que tentou gravar) - nunca vai para a URL/tela; so para o log.
    console.error('Erro ao conectar o Mercado Livre:', error);
    baseUrl.searchParams.set('erro', 'Não foi possível concluir a conexão com o Mercado Livre. Tente conectar de novo; se repetir, confira se o aplicativo de lá tem o acesso offline e o endereço de retorno certos.');
  }

  return NextResponse.redirect(baseUrl);
}
