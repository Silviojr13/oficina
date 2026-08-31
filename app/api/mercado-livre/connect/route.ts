import { NextResponse } from 'next/server';
import { getAuthorizationUrl } from '@/lib/mercado-livre';
import { auth } from '@/lib/auth';

export async function GET() {
  // Fora de /admin/*, entao o proxy.ts nao cobre esta rota - guarda aqui direto.
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Sem permissão para gerenciar integrações.' }, { status: 403 });
  }

  try {
    const url = await getAuthorizationUrl();
    return NextResponse.redirect(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
