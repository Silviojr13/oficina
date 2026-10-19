import 'server-only';
import { ML_API, SITE_ID, getValidAccessToken } from './mercado-livre-auth';

// Criar e atualizar anuncios. Fora do arquivo 'use server' de proposito: la,
// funcao exportada vira Server Action chamavel por qualquer visitante - e
// estas publicam na conta do Mercado Livre da loja. Quem chama confere a
// permissao (ver publicarNoMercadoLivre em lib/actions/produtos.ts).

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
  sku?: string | null;
  codigoOEM?: string | null;
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
    // Categorias de autopeca costumam exigir o numero da peca; o SKU ajuda a
    // achar o produto do sistema no painel do Mercado Livre.
    if (produto.codigoOEM) attributes.push({ id: 'PART_NUMBER', value_name: produto.codigoOEM });
    if (produto.sku) attributes.push({ id: 'SELLER_SKU', value_name: produto.sku });

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

// Produto ja anunciado: so atualiza preco e quantidade, sem criar outro
// anuncio (republicar duplicaria).
export async function atualizarAnuncioMercadoLivre(mercadoLivreId: string, preco: number, quantidade: number) {
  try {
    const accessToken = await getValidAccessToken();
    const res = await fetch(`${ML_API}/items/${mercadoLivreId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ price: preco, available_quantity: Math.max(0, quantidade) }),
    });
    const data = await res.json();
    if (!res.ok) {
      const mensagem = data?.message || data?.cause?.map((c: { message: string }) => c.message).join('; ') || JSON.stringify(data);
      return { success: false as const, error: `Mercado Livre recusou a atualização: ${mensagem}` };
    }
    return { success: true as const, permalink: data.permalink as string | undefined };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : 'Erro desconhecido ao atualizar o anúncio.' };
  }
}
