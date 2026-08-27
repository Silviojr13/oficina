import { NextResponse } from 'next/server';
import { getAuthorizationUrl } from '@/lib/mercado-livre';

export async function GET() {
  try {
    const url = await getAuthorizationUrl();
    return NextResponse.redirect(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
