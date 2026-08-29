'use server';

import { revalidatePath } from 'next/cache';
import prisma from '../prisma';
import { criarAnuncioMercadoLivre } from '../mercado-livre';

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

    if (!produto) {
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
      where: { exibirNoSite: true },
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

export async function getProdutos(page: number = 1, limit: number = 10, search?: string) {
  try {
    const skip = (page - 1) * limit;

    let whereClause: any = {};
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

export async function createProduto(data: any) {
  try {
    const produtoData = {
      ...data,
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

    sincronizarComMercadoLivre(produto.id).catch((error) => {
      console.error('Erro ao sincronizar produto com Mercado Livre:', error);
    });

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

export async function reenviarParaMercadoLivre(produtoId: string) {
  await sincronizarComMercadoLivre(produtoId);
  revalidatePath('/admin/produtos');
}

export async function updateProduto(id: string, data: any) {
  try {
    const produtoData = {
      ...data,
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
    await prisma.produto.delete({
      where: { id },
    });

    revalidatePath('/admin/produtos');
    revalidatePath('/');
    revalidatePath('/produtos');

    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}