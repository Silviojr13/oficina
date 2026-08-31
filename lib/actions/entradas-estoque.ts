'use server';

import { revalidatePath } from 'next/cache';
import prisma from '../prisma';
import { parseDateFields } from '../prisma-helpers';
import { requireAdmin } from '../auth-guard';

export async function getEntradaEstoque(id: string) {
  try {
    const entrada = await prisma.entradaEstoque.findUnique({
      where: { id },
      include: {
        itens: {
          include: {
            produto: true, // Include product info for each item
          }
        },
        fornecedor: true, // Include supplier info
      },
    });

    return entrada;
  } catch (error) {
    console.error('Erro ao buscar entrada de estoque:', error);
    return null;
  }
}

export async function getEntradasEstoque(page: number = 1, limit: number = 10, search?: string) {
  try {
    const skip = (page - 1) * limit;

    let whereClause: any = {};
    if (search) {
      // Search by supplier name or NF number
      whereClause.OR = [
        { fornecedor: { nomeFantasia: { contains: search, mode: 'insensitive' } } },
        { numeroNF: { contains: search, mode: 'insensitive' } },
      ];
    }

    const entradas = await prisma.entradaEstoque.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { dataEntrada: 'desc' }, // Order by entry date
      include: {
        itens: {
          include: {
            produto: true, // Include product info for each item
          }
        },
        fornecedor: true, // Include supplier info
      },
    });

    const total = await prisma.entradaEstoque.count({
      where: whereClause,
    });

    return {
      data: entradas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Erro ao buscar entradas de estoque:', error);
    return { data: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } };
  }
}

export async function createEntradaEstoque(data: any) {
  try {
    const entradaData = {
      ...parseDateFields(data, ['dataEmissao', 'dataEntrada', 'dataVencimento']),
      itens: {
        create: data.itens,
      },
    };

    // Uma entrada de estoque (compra) precisa somar no estoque dos produtos
    // recebidos - sem isso "Estoque Atual" fica descolado da realidade a
    // cada compra registrada. Tudo numa transacao pra nao creditar estoque
    // se a entrada falhar (ou vice-versa).
    const [entrada] = await prisma.$transaction([
      prisma.entradaEstoque.create({
        data: entradaData,
        include: {
          itens: {
            include: {
              produto: true,
            }
          },
          fornecedor: true,
        },
      }),
      ...data.itens.map((item: any) =>
        prisma.produto.update({
          where: { id: item.produtoId },
          data: { estoqueAtual: { increment: item.quantidade } },
        })
      ),
    ]);

    revalidatePath('/admin/compras');
    revalidatePath('/admin/produtos');
    revalidatePath('/admin/estoque');

    return { success: true, data: entrada };
  } catch (error) {
    console.error('Erro ao criar entrada de estoque:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export async function updateEntradaEstoque(id: string, data: any) {
  try {
    const entradaAnterior = await prisma.entradaEstoque.findUnique({
      where: { id },
      include: { itens: true },
    });
    if (!entradaAnterior) {
      return { success: false, error: 'Entrada de estoque não encontrada' };
    }

    const entradaData = {
      ...parseDateFields(data, ['dataEmissao', 'dataEntrada', 'dataVencimento']),
      itens: {
        deleteMany: {}, // Delete old items
        create: data.itens, // Create new items
      },
    };

    // Desfaz o credito dos itens antigos e credita os itens novos, senao os
    // ajustes de uma entrada editada nunca refletem no estoque.
    const [entrada] = await prisma.$transaction([
      prisma.entradaEstoque.update({
        where: { id },
        data: entradaData,
        include: {
          itens: {
            include: {
              produto: true,
            }
          },
          fornecedor: true,
        },
      }),
      ...entradaAnterior.itens.map((item) =>
        prisma.produto.update({
          where: { id: item.produtoId },
          data: { estoqueAtual: { decrement: item.quantidade } },
        })
      ),
      ...data.itens.map((item: any) =>
        prisma.produto.update({
          where: { id: item.produtoId },
          data: { estoqueAtual: { increment: item.quantidade } },
        })
      ),
    ]);

    revalidatePath(`/admin/compras/${id}`);
    revalidatePath('/admin/compras');
    revalidatePath('/admin/produtos');
    revalidatePath('/admin/estoque');

    return { success: true, data: entrada };
  } catch (error) {
    console.error('Erro ao atualizar entrada de estoque:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export async function deleteEntradaEstoque(id: string) {
  try {
    await requireAdmin();
    const entrada = await prisma.entradaEstoque.findUnique({
      where: { id },
      include: { itens: true },
    });
    if (!entrada) {
      return { success: false, error: 'Entrada de estoque não encontrada' };
    }

    // Cancelar a entrada tem que desfazer o credito que ela deu no estoque.
    await prisma.$transaction([
      prisma.entradaEstoque.delete({ where: { id } }),
      ...entrada.itens.map((item) =>
        prisma.produto.update({
          where: { id: item.produtoId },
          data: { estoqueAtual: { decrement: item.quantidade } },
        })
      ),
    ]);

    revalidatePath('/admin/compras');
    revalidatePath('/admin/produtos');
    revalidatePath('/admin/estoque');

    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar entrada de estoque:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}