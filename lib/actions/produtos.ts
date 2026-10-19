'use server';

import { revalidatePath } from 'next/cache';
import prisma from '../prisma';
import { criarAnuncioMercadoLivre, atualizarAnuncioMercadoLivre } from '../mercado-livre-anuncios';
import { parseDateFields } from '../prisma-helpers';
import { requireAdmin, requireStaff } from '../auth-guard';

// Busca exata pelo que o leitor de codigo de barras devolve. Uma etiqueta
// pode trazer o EAN do fabricante, o SKU interno ou o codigo OEM da peca,
// entao procura nos tres. Comparacao exata (sem contains): um EAN-13 que
// casa "pela metade" com outro produto seria pior do que nao achar nada.
export async function buscarProdutoPorCodigo(codigo: string) {
  try {
    await requireStaff();
    const termo = codigo?.trim();
    if (!termo) return null;

    return await prisma.produto.findFirst({
      where: {
        OR: [{ codigoBarras: termo }, { sku: termo }, { sku: termo.toUpperCase() }, { codigoOEM: termo }],
      },
      select: {
        id: true,
        nome: true,
        sku: true,
        codigoBarras: true,
        codigoOEM: true,
        marca: true,
        categoria: true,
        imagemPrincipal: true,
        estoqueAtual: true,
        estoqueMinimo: true,
        ativo: true,
        localizacaoEstoque: true,
        setorAlmoxarifado: true,
        precoVendaBalcao: true,
        precoSite: true,
        // Sem custo/margem: funcionario tambem usa o scanner, e custo e dado
        // financeiro que so o admin ve.
      },
    });
  } catch (error) {
    console.error('Erro ao buscar produto por código:', error);
    return null;
  }
}

export async function getProduto(id: string) {
  try {
    const produto = await prisma.produto.findUnique({
      where: { id },
      include: {
        veiculosCompativeis: true,
      },
    });

    if (!produto) {
      return null;
    }

    // Parse JSON fields
    return {
      ...produto,
      referenciaCruzada: produto.referenciaCruzada ? JSON.parse(produto.referenciaCruzada as string) : [],
      tags: produto.tags ? JSON.parse(produto.tags as string) : [],
      fotos: produto.fotos ? JSON.parse(produto.fotos as string) : [],
      caracteristicas: produto.caracteristicas ? JSON.parse(produto.caracteristicas as string) : [],
    };
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return null;
  }
}

export async function getProdutoBySlug(slug: string) {
  try {
    const produto = await prisma.produto.findUnique({
      where: { slug },
      include: {
        veiculosCompativeis: true,
      },
    });

    if (!produto || !produto.ativo) {
      return null;
    }

    return {
      ...produto,
      referenciaCruzada: produto.referenciaCruzada ? JSON.parse(produto.referenciaCruzada as string) : [],
      tags: produto.tags ? JSON.parse(produto.tags as string) : [],
      fotos: produto.fotos ? JSON.parse(produto.fotos as string) : [],
      caracteristicas: produto.caracteristicas ? JSON.parse(produto.caracteristicas as string) : [],
    };
  } catch (error) {
    console.error('Erro ao buscar produto por slug:', error);
    return null;
  }
}

// Catálogo da loja pública: só produtos marcados para exibição no site.
export async function getProdutosPublicos() {
  try {
    const produtos = await prisma.produto.findMany({
      where: { exibirNoSite: true, ativo: true },
      orderBy: { createdAt: 'desc' },
      include: {
        veiculosCompativeis: true,
      },
    });

    return produtos.map((produto) => ({
      ...produto,
      referenciaCruzada: produto.referenciaCruzada ? JSON.parse(produto.referenciaCruzada as string) : [],
      tags: produto.tags ? JSON.parse(produto.tags as string) : [],
      fotos: produto.fotos ? JSON.parse(produto.fotos as string) : [],
      caracteristicas: produto.caracteristicas ? JSON.parse(produto.caracteristicas as string) : [],
    }));
  } catch (error) {
    console.error('Erro ao buscar catálogo público:', error);
    return [];
  }
}

// Arquivados ("saiu de linha") ficam fora por padrao: nao aparecem para
// escolher em venda, compra ou OS. A tela de Estoque pede com
// incluirArquivados para poder reativar.
export async function getProdutos(page: number = 1, limit: number = 10, search?: string, incluirArquivados = false) {
  try {
    const skip = (page - 1) * limit;

    let whereClause: any = incluirArquivados ? {} : { ativo: true };
    if (search) {
      whereClause.nome = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const produtos = await prisma.produto.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        veiculosCompativeis: true,
      },
    });

    const total = await prisma.produto.count({
      where: whereClause,
    });

    // Parse JSON fields for each product
    const parsedProdutos = produtos.map(produto => ({
      ...produto,
      referenciaCruzada: produto.referenciaCruzada ? JSON.parse(produto.referenciaCruzada as string) : [],
      tags: produto.tags ? JSON.parse(produto.tags as string) : [],
      fotos: produto.fotos ? JSON.parse(produto.fotos as string) : [],
      caracteristicas: produto.caracteristicas ? JSON.parse(produto.caracteristicas as string) : [],
    }));

    return {
      data: parsedProdutos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return { data: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } };
  }
}

function semAcento(texto: string) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// SKU e o codigo interno da oficina (nao vem na nota do fornecedor), entao o
// sistema gera: 3 letras da categoria + sequencia. Filtros -> FIL-00001.
async function gerarSku(categoria: string) {
  const prefixo = semAcento(categoria ?? '').replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'PRD';
  const existentes = await prisma.produto.findMany({
    where: { sku: { startsWith: `${prefixo}-` } },
    select: { sku: true },
  });
  const maior = existentes.reduce((max, { sku }) => {
    const n = parseInt(sku.slice(prefixo.length + 1), 10);
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  return `${prefixo}-${String(maior + 1).padStart(5, '0')}`;
}

// Endereco do produto na loja (/produto/<slug>), gerado do nome. Se ja
// existir, acrescenta -2, -3...
async function gerarSlugUnico(base: string, ignorarId?: string) {
  const raiz =
    semAcento(base ?? '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'produto';
  for (let i = 1; ; i++) {
    const slug = i === 1 ? raiz : `${raiz}-${i}`;
    const existente = await prisma.produto.findUnique({ where: { slug }, select: { id: true } });
    if (!existente || existente.id === ignorarId) return slug;
  }
}

export async function createProduto(data: any) {
  try {
    const sku = typeof data.sku === 'string' && data.sku.trim() ? data.sku.trim() : await gerarSku(data.categoria);
    const slug = await gerarSlugUnico(data.slug || data.nome);
    const produtoData = {
      ...parseDateFields(data, ['dataInicioPromocao', 'dataFimPromocao']),
      sku,
      slug,
      referenciaCruzada: data.referenciaCruzada ? JSON.stringify(data.referenciaCruzada) : null,
      tags: data.tags ? JSON.stringify(data.tags) : null,
      fotos: data.fotos ? JSON.stringify(data.fotos) : null,
      caracteristicas: data.caracteristicas ? JSON.stringify(data.caracteristicas) : null,
      veiculosCompativeis: {
        // O id vindo do form é só uma chave local (Date.now()) - o Prisma
        // deve gerar o cuid de verdade.
        create: data.veiculosCompativeis?.map(({ id, ...v }: any) => v),
      },
    };

    const produto = await prisma.produto.create({
      data: produtoData,
      include: {
        veiculosCompativeis: true,
      },
    });

    // So publica sozinho o que foi marcado para a loja online - peca de uso
    // interno da oficina nao vira anuncio. As outras se publicam pelo botao
    // na tela do produto.
    if (produto.exibirNoSite) {
      sincronizarComMercadoLivre(produto.id).catch((error) => {
        console.error('Erro ao sincronizar produto com Mercado Livre:', error);
      });
    }

    revalidatePath('/admin/produtos');
    revalidatePath('/admin/produtos/novo');
    revalidatePath('/');
    revalidatePath('/produtos');

    return { success: true, data: produto };
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

// Publica o produto no Mercado Livre em segundo plano. Falhas aqui nunca devem
// impedir o cadastro do produto - o resultado fica registrado nos campos
// mercadoLivre* do produto para o usuário conferir/tentar de novo depois.
async function sincronizarComMercadoLivre(produtoId: string) {
  const produto = await prisma.produto.findUnique({ where: { id: produtoId } });
  if (!produto) return;

  const resultado = await criarAnuncioMercadoLivre(produto);

  await prisma.produto.update({
    where: { id: produtoId },
    data: resultado.success
      ? {
          mercadoLivreId: resultado.mercadoLivreId,
          mercadoLivreStatus: 'sincronizado',
          mercadoLivreErro: null,
          mercadoLivreSyncEm: new Date(),
        }
      : {
          mercadoLivreStatus: 'erro',
          mercadoLivreErro: resultado.error,
          mercadoLivreSyncEm: new Date(),
        },
  });

  revalidatePath('/admin/produtos');
}

// Botao "Publicar no Mercado Livre" da tela do produto. Sem anuncio: cria.
// Com anuncio: so atualiza preco e estoque (criar de novo duplicaria).
export async function publicarNoMercadoLivre(produtoId: string) {
  try {
    await requireAdmin();
    const produto = await prisma.produto.findUnique({ where: { id: produtoId } });
    if (!produto) return { success: false, error: 'Produto não encontrado.' };

    if (produto.mercadoLivreId) {
      const preco = produto.precoSite ?? produto.precoVendaBalcao ?? 0;
      const r = await atualizarAnuncioMercadoLivre(produto.mercadoLivreId, preco, produto.estoqueAtual);
      await prisma.produto.update({
        where: { id: produtoId },
        data: r.success
          ? { mercadoLivreStatus: 'sincronizado', mercadoLivreErro: null, mercadoLivreSyncEm: new Date() }
          : { mercadoLivreStatus: 'erro', mercadoLivreErro: r.error, mercadoLivreSyncEm: new Date() },
      });
      revalidatePath('/admin/estoque');
      return r.success ? { success: true, acao: 'atualizado' as const } : { success: false, error: r.error };
    }

    await sincronizarComMercadoLivre(produtoId);
    const depois = await prisma.produto.findUnique({ where: { id: produtoId }, select: { mercadoLivreStatus: true, mercadoLivreErro: true, mercadoLivreId: true } });
    revalidatePath('/admin/estoque');
    return depois?.mercadoLivreStatus === 'sincronizado'
      ? { success: true, acao: 'publicado' as const, mercadoLivreId: depois.mercadoLivreId }
      : { success: false, error: depois?.mercadoLivreErro ?? 'O Mercado Livre não aceitou o anúncio.' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export async function updateProduto(id: string, data: any) {
  try {
    const produtoData = {
      ...parseDateFields(data, ['dataInicioPromocao', 'dataFimPromocao']),
      referenciaCruzada: data.referenciaCruzada ? JSON.stringify(data.referenciaCruzada) : null,
      tags: data.tags ? JSON.stringify(data.tags) : null,
      fotos: data.fotos ? JSON.stringify(data.fotos) : null,
      caracteristicas: data.caracteristicas ? JSON.stringify(data.caracteristicas) : null,
      veiculosCompativeis: {
        deleteMany: {},
        create: data.veiculosCompativeis?.map(({ id, ...v }: any) => v),
      },
    };

    const produto = await prisma.produto.update({
      where: { id },
      data: produtoData,
      include: {
        veiculosCompativeis: true,
      },
    });

    revalidatePath(`/admin/produtos/${id}`);
    revalidatePath('/admin/produtos');
    revalidatePath('/');
    revalidatePath('/produtos');

    return { success: true, data: produto };
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export async function deleteProduto(id: string) {
  try {
    await requireAdmin();
    await prisma.produto.delete({
      where: { id },
    });

    revalidatePath('/admin/produtos');
    revalidatePath('/');
    revalidatePath('/produtos');

    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar produto:', error);

    // SQLite/Turso recusa o delete com "FOREIGN KEY constraint failed" quando o
    // produto ja foi usado em uma venda, compra ou ordem de servico - historico
    // que nao pode ser apagado. Traduz pra uma mensagem que o usuario entenda.
    const mensagemOriginal = error instanceof Error ? error.message : 'Erro desconhecido';
    if (mensagemOriginal.includes('FOREIGN KEY constraint failed')) {
      // emUso: a tela oferece arquivar no lugar de excluir.
      return {
        success: false,
        emUso: true,
        error: 'Este produto já aparece em vendas, compras ou ordens de serviço, então não pode ser excluído sem apagar esse histórico. Arquive-o: ele some do estoque e da loja, mas o histórico fica.',
      };
    }

    return { success: false, error: mensagemOriginal };
  }
}

// "Saiu de linha": tira o produto do estoque, das buscas e da loja sem
// apagar o historico. Tambem tira do site (exibirNoSite) para nao voltar
// a aparecer na loja se for reativado sem querer.
export async function arquivarProduto(id: string, arquivar: boolean) {
  try {
    await requireAdmin();
    await prisma.produto.update({
      where: { id },
      data: arquivar ? { ativo: false, exibirNoSite: false } : { ativo: true },
    });

    revalidatePath('/admin/estoque');
    revalidatePath('/');
    revalidatePath('/produtos');
    return { success: true };
  } catch (error) {
    console.error('Erro ao arquivar produto:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}