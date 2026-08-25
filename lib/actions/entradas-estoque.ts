'use server';

import { revalidatePath } from 'next/cache';
import prisma from '../prisma';

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
      ...data,
      itens: {
        create: data.itens,
      },
    };

    const entrada = await prisma.entradaEstoque.create({
      data: entradaData,
      include: {
        itens: {
          include: {
            produto: true,
          }
        },
        fornecedor: true,
      },
    });

    revalidatePath('/admin/entradas-estoque');
    revalidatePath('/admin/entradas-estoque/nova');

    return { success: true, data: entrada };
  } catch (error) {
    console.error('Erro ao criar entrada de estoque:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export async function updateEntradaEstoque(id: string, data: any) {
  try {
    const entradaData = {
      ...data,
      itens: {
        deleteMany: {}, // Delete old items
        create: data.itens, // Create new items
      },
    };

    const entrada = await prisma.entradaEstoque.update({
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
    });

    revalidatePath(`/admin/entradas-estoque/${id}`);
    revalidatePath('/admin/entradas-estoque');

    return { success: true, data: entrada };
  } catch (error) {
    console.error('Erro ao atualizar entrada de estoque:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export async function deleteEntradaEstoque(id: string) {
  try {
    await prisma.entradaEstoque.delete({
      where: { id },
    });

    revalidatePath('/admin/entradas-estoque');

    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar entrada de estoque:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}