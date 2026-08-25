'use server';

import { revalidatePath } from 'next/cache';
import prisma from '../prisma';

export async function getFornecedor(id: string) {
  try {
    const fornecedor = await prisma.fornecedor.findUnique({
      where: { id },
    });

    return fornecedor;
  } catch (error) {
    console.error('Erro ao buscar fornecedor:', error);
    return null;
  }
}

export async function getFornecedores(page: number = 1, limit: number = 10, search?: string) {
  try {
    const skip = (page - 1) * limit;

    let whereClause: any = {};
    if (search) {
      whereClause.razaoSocial = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const fornecedores = await prisma.fornecedor.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.fornecedor.count({
      where: whereClause,
    });

    return {
      data: fornecedores,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Erro ao buscar fornecedores:', error);
    return { data: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } };
  }
}

export async function createFornecedor(data: any) {
  try {
    const fornecedor = await prisma.fornecedor.create({
      data,
    });

    revalidatePath('/admin/fornecedores');
    revalidatePath('/admin/fornecedores/novo');

    return { success: true, data: fornecedor };
  } catch (error) {
    console.error('Erro ao criar fornecedor:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export async function updateFornecedor(id: string, data: any) {
  try {
    const fornecedor = await prisma.fornecedor.update({
      where: { id },
      data,
    });

    revalidatePath(`/admin/fornecedores/${id}`);
    revalidatePath('/admin/fornecedores');

    return { success: true, data: fornecedor };
  } catch (error) {
    console.error('Erro ao atualizar fornecedor:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export async function deleteFornecedor(id: string) {
  try {
    await prisma.fornecedor.delete({
      where: { id },
    });

    revalidatePath('/admin/fornecedores');

    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar fornecedor:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}