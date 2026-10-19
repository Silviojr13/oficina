'use server';

import prisma from './prisma';
import { requireAdmin } from './auth-guard';
import { ML_API, SITE_ID, CHAVE_CONFIG, getCredentials, resolverRedirectUri, saveToken, getValidAccessToken, type TokenResponse } from './mercado-livre-auth';

export async function getStatusMercadoLivre(origem: string) {
  await requireAdmin();
  const temEnv = !!(process.env.MERCADOLIVRE_CLIENT_ID && process.env.MERCADOLIVRE_CLIENT_SECRET);
  const linha = await prisma.configuracao.findUnique({ where: { chave: CHAVE_CONFIG } });
  const salvo = linha ? (JSON.parse(linha.valor) as { clientId?: string }) : null;
  const clientId = temEnv ? process.env.MERCADOLIVRE_CLIENT_ID! : salvo?.clientId;
  const token = await prisma.mercadoLivreToken.findFirst({ orderBy: { createdAt: 'desc' } });
  return {
    configurado: !!clientId,
    origem: temEnv ? ('vercel' as const) : clientId ? ('sistema' as const) : null,
    clientId: clientId ?? null,
    redirectUri: resolverRedirectUri(origem),
    urlNotificacoes: `${origem}/api/mercado-livre/notificacoes`,
    conectado: !!token,
    contaId: token?.userId ?? null,
  };
}

export async function salvarCredenciaisMercadoLivre(dados: { clientId: string; clientSecret: string }) {
  try {
    await requireAdmin();
    const clientId = dados.clientId.trim();
    const clientSecret = dados.clientSecret.trim();
    if (!/^\d{6,}$/.test(clientId)) return { success: false, error: 'O Client ID do Mercado Livre é só números (ex.: 1234567890123456).' };
    if (clientSecret.length < 16) return { success: false, error: 'O Client Secret parece incompleto. Copie de novo a "Secret Key" do aplicativo.' };
    const valor = JSON.stringify({ clientId, clientSecret });
    await prisma.configuracao.upsert({ where: { chave: CHAVE_CONFIG }, create: { chave: CHAVE_CONFIG, valor }, update: { valor } });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export async function getAuthorizationUrl(origem: string) {
  const { clientId } = await getCredentials();
  const redirectUri = resolverRedirectUri(origem);
  const url = new URL('https://auth.mercadolivre.com.br/authorization');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  return url.toString();
}

export async function exchangeCodeForToken(code: string, origem: string) {
  await requireAdmin();
  const { clientId, clientSecret } = await getCredentials();
  const redirectUri = resolverRedirectUri(origem);

  const res = await fetch(`${ML_API}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) {
    throw new Error(`Falha ao trocar code por token: ${res.status} ${await res.text()}`);
  }

  const data: TokenResponse = await res.json();
  await saveToken(data);
  return data;
}

export async function isConectado() {
  const token = await prisma.mercadoLivreToken.findFirst({ orderBy: { createdAt: 'desc' } });
  return !!token;
}
