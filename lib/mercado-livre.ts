'use server';

import prisma from './prisma';

const ML_API = 'https://api.mercadolibre.com';
const SITE_ID = 'MLB'; // Brasil

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user_id: number;
};

function getCredentials() {
  const clientId = process.env.MERCADOLIVRE_CLIENT_ID;
  const clientSecret = process.env.MERCADOLIVRE_CLIENT_SECRET;
  const redirectUri = process.env.MERCADOLIVRE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      'Mercado Livre não configurado: defina MERCADOLIVRE_CLIENT_ID, MERCADOLIVRE_CLIENT_SECRET e MERCADOLIVRE_REDIRECT_URI.'
    );
  }
  return { clientId, clientSecret, redirectUri };
}

export async function getAuthorizationUrl() {
  const { clientId, redirectUri } = getCredentials();
  const url = new URL('https://auth.mercadolivre.com.br/authorization');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  return url.toString();
}

export async function exchangeCodeForToken(code: string) {
  const { clientId, clientSecret, redirectUri } = getCredentials();

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

async function saveToken(data: TokenResponse) {
  const expiresAt = new Date(Date.now() + data.expires_in * 1000);
  const existing = await prisma.mercadoLivreToken.findFirst({ orderBy: { createdAt: 'desc' } });

  if (existing) {
    await prisma.mercadoLivreToken.update({
      where: { id: existing.id },
      data: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        userId: String(data.user_id),
        expiresAt,
      },
    });
  } else {
    await prisma.mercadoLivreToken.create({
      data: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        userId: String(data.user_id),
        expiresAt,
      },
    });
  }
}

async function getValidAccessToken(): Promise<string> {
  const token = await prisma.mercadoLivreToken.findFirst({ orderBy: { createdAt: 'desc' } });
  if (!token) {
    throw new Error('Mercado Livre não conectado. Acesse Integrações e conecte sua conta.');
  }

  const margemSegurancaMs = 5 * 60 * 1000; // renova 5 min antes de expirar
  if (token.expiresAt.getTime() - margemSegurancaMs > Date.now()) {
    return token.accessToken;
  }

  const { clientId, clientSecret } = getCredentials();
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

export async function isConectado() {
  const token = await prisma.mercadoLivreToken.findFirst({ orderBy: { createdAt: 'desc' } });
  return !!token;
}

async function predizerCategoria(titulo: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${ML_API}/sites/${SITE_ID}/domain_discovery/search?limit=1&q=${encodeURIComponent(titulo)}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.[0]?.category_id ?? null;
  } catch {
    return null;
  }
}

type ProdutoParaML = {
  id: string;
  nome: string;
  marca: string;
  categoria: string;
  codigoBarras: string | null;
  descricaoCurta: string | null;
  descricaoCompleta: string | null;
  precoSite: number | null;
  precoVendaBalcao: number | null;
  precoVendaSugerido: number | null;
  estoqueAtual: number;
  imagemPrincipal: string | null;
  tipoPeca: string;
};

export async function criarAnuncioMercadoLivre(produto: ProdutoParaML) {
  try {
    const preco = produto.precoSite ?? produto.precoVendaBalcao ?? produto.precoVendaSugerido;
    if (!preco || preco <= 0) {
      return { success: false as const, error: 'Produto sem preço de venda definido.' };
    }
    if (!produto.estoqueAtual || produto.estoqueAtual <= 0) {
      return { success: false as const, error: 'Produto sem estoque disponível para anunciar.' };
    }

    const accessToken = await getValidAccessToken();
    const categoryId = await predizerCategoria(produto.nome);
    if (!categoryId) {
      return { success: false as const, error: 'Não foi possível determinar a categoria do Mercado Livre para este produto.' };
    }

    const condicao = produto.tipoPeca === 'remanufaturada' || produto.tipoPeca === 'revisada' ? 'used' : 'new';

    const attributes: { id: string; value_name: string }[] = [{ id: 'BRAND', value_name: produto.marca }];
    if (produto.codigoBarras) {
      attributes.push({ id: 'GTIN', value_name: produto.codigoBarras });
    }

    const body: Record<string, unknown> = {
      title: produto.nome.slice(0, 60),
      category_id: categoryId,
      price: preco,
      currency_id: 'BRL',
      available_quantity: produto.estoqueAtual,
      buying_mode: 'buy_it_now',
      listing_type_id: process.env.MERCADOLIVRE_LISTING_TYPE || 'gold_special',
      condition: condicao,
      attributes,
    };

    if (produto.imagemPrincipal && /^https?:\/\//.test(produto.imagemPrincipal)) {
      body.pictures = [{ source: produto.imagemPrincipal }];
    }

    const res = await fetch(`${ML_API}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const responseData = await res.json();

    if (!res.ok) {
      const mensagem = responseData?.message || responseData?.cause?.map((c: { message: string }) => c.message).join('; ') || JSON.stringify(responseData);
      return { success: false as const, error: `Mercado Livre recusou o anúncio: ${mensagem}` };
    }

    const descricao = produto.descricaoCompleta || produto.descricaoCurta;
    if (descricao) {
      await fetch(`${ML_API}/items/${responseData.id}/description`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ plain_text: descricao }),
      }).catch(() => {
        // a descrição é secundária: não falha a criação do anúncio se isso der erro
      });
    }

    return { success: true as const, mercadoLivreId: responseData.id as string, permalink: responseData.permalink as string };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : 'Erro desconhecido ao publicar no Mercado Livre.' };
  }
}
