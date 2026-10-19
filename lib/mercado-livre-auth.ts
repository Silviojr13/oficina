import 'server-only';
import prisma from './prisma';

// Autenticacao com o Mercado Livre (credenciais e token). Fica fora do
// arquivo 'use server' de proposito: la, toda funcao exportada vira uma
// Server Action chamavel pelo navegador - e getValidAccessToken devolve o
// token de acesso da conta.

export const ML_API = 'https://api.mercadolibre.com';
export const SITE_ID = 'MLB'; // Brasil

export type TokenResponse = {
  access_token: string;
  // So vem quando o aplicativo tem o escopo de acesso offline.
  refresh_token?: string;
  expires_in: number;
  user_id: number;
};

export const CHAVE_CONFIG = 'mercadolivre';

// Credenciais do aplicativo do Mercado Livre. Variaveis de ambiente (Vercel)
// tem prioridade; se nao existirem, usa o que o admin salvou na tela de
// Integracoes - assim da para configurar sem mexer na Vercel.
export async function getCredentials() {
  let clientId = process.env.MERCADOLIVRE_CLIENT_ID;
  let clientSecret = process.env.MERCADOLIVRE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    const linha = await prisma.configuracao.findUnique({ where: { chave: CHAVE_CONFIG } });
    if (linha) {
      const salvo = JSON.parse(linha.valor) as { clientId?: string; clientSecret?: string };
      clientId = salvo.clientId;
      clientSecret = salvo.clientSecret;
    }
  }
  if (!clientId || !clientSecret) {
    throw new Error('Mercado Livre ainda não configurado: informe o Client ID e o Client Secret em Integrações.');
  }
  return { clientId, clientSecret };
}

// Endereco de retorno do login no Mercado Livre. Tem que ser exatamente o
// cadastrado no aplicativo de la; vem sempre do dominio em que o site esta
// aberto. Nao usa mais MERCADOLIVRE_REDIRECT_URI: a da Vercel tinha sido
// importada do .env local com "localhost" e aparecia em producao.
export function resolverRedirectUri(origem: string) {
  return `${origem}/api/mercado-livre/callback`;
}

export async function saveToken(data: TokenResponse) {
  const expiresAt = new Date(Date.now() + data.expires_in * 1000);
  const existing = await prisma.mercadoLivreToken.findFirst({ orderBy: { createdAt: 'desc' } });

  if (existing) {
    await prisma.mercadoLivreToken.update({
      where: { id: existing.id },
      data: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? '',
        userId: String(data.user_id),
        expiresAt,
      },
    });
  } else {
    await prisma.mercadoLivreToken.create({
      data: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? '',
        userId: String(data.user_id),
        expiresAt,
      },
    });
  }
}

export async function getValidAccessToken(): Promise<string> {
  const token = await prisma.mercadoLivreToken.findFirst({ orderBy: { createdAt: 'desc' } });
  if (!token) {
    throw new Error('Mercado Livre não conectado. Acesse Integrações e conecte sua conta.');
  }

  const margemSegurancaMs = 5 * 60 * 1000; // renova 5 min antes de expirar
  if (token.expiresAt.getTime() - margemSegurancaMs > Date.now()) {
    return token.accessToken;
  }

  // Sem refresh token (aplicativo sem o escopo offline) nao da para renovar:
  // a conexao vale ~6 horas e depois precisa reconectar.
  if (!token.refreshToken) {
    throw new Error('A conexão com o Mercado Livre expirou. Ative o "acesso offline" no aplicativo do Mercado Livre e reconecte em Integrações.');
  }

  const { clientId, clientSecret } = await getCredentials();
  const res = await fetch(`${ML_API}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: token.refreshToken,
    }),
  });

  if (!res.ok) {
    throw new Error(`Falha ao renovar token do Mercado Livre: ${res.status} ${await res.text()}`);
  }

  const data: TokenResponse = await res.json();
  await saveToken(data);
  return data.access_token;
}
