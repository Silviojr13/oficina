import { NextResponse, after } from 'next/server';
import { processarAvisoMercadoLivre, type AvisoMercadoLivre } from '@/lib/mercado-livre-notificacoes';

// Endereco cadastrado em "URL de retornos de chamada de notificacao" no
// aplicativo do Mercado Livre. Ele exige resposta em ate ~500 ms (senao
// considera falha e reenvia), entao responde na hora e processa depois.
export async function POST(request: Request) {
  let aviso: AvisoMercadoLivre = {};
  try {
    aviso = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  after(() => processarAvisoMercadoLivre(aviso));
  return NextResponse.json({ ok: true });
}

// O painel do Mercado Livre pode testar se o endereco existe.
export async function GET() {
  return NextResponse.json({ ok: true });
}
