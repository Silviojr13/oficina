'use server';

import { revalidatePath } from 'next/cache';
import prisma from '../prisma';
import { parseDateFields } from '../prisma-helpers';
import { requireAdmin } from '../auth-guard';

export async function getGasto(id: string) {
  try {
    await requireAdmin();
    const gasto = await prisma.gasto.findUnique({
      where: { id },
    });

    if (!gasto) {
      return null;
    }

    return gasto;
  } catch (error) {
    console.error('Erro ao buscar gasto:', error);
    return null;
  }
}

export async function getGastos(page: number = 1, limit: number = 10, search?: string) {
  try {
    await requireAdmin();
    const skip = (page - 1) * limit;

    let whereClause: any = {};
    if (search) {
      whereClause.descricao = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const gastos = await prisma.gasto.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.gasto.count({
      where: whereClause,
    });

    return {
      data: gastos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Erro ao buscar gastos:', error);
    return { data: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } };
  }
}

export async function createGasto(data: any) {
  try {
    await requireAdmin();
    const gasto = await prisma.gasto.create({
      data: parseDateFields(data, ['dataVencimento', 'dataPagamento']),
    });

    revalidatePath('/admin/gastos');
    revalidatePath('/admin/gastos/novo');

    return { success: true, data: gasto };
  } catch (error) {
    console.error('Erro ao criar gasto:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export async function updateGasto(id: string, data: any) {
  try {
    await requireAdmin();
    const gasto = await prisma.gasto.update({
      where: { id },
      data: parseDateFields(data, ['dataVencimento', 'dataPagamento']),
    });

    revalidatePath(`/admin/gastos/${id}`);
    revalidatePath('/admin/gastos');

    return { success: true, data: gasto };
  } catch (error) {
    console.error('Erro ao atualizar gasto:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export async function deleteGasto(id: string) {
  try {
    await requireAdmin();
    await prisma.gasto.delete({
      where: { id },
    });

    revalidatePath('/admin/gastos');

    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar gasto:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

// Action to mark a gasto as paid
export async function marcarGastoComoPago(id: string, pago: boolean) {
  try {
    await requireAdmin();
    const gasto = await prisma.gasto.update({
      where: { id },
      data: { status: pago ? 'pago' : 'pendente' },
    });

    revalidatePath(`/admin/gastos/${id}`);
    revalidatePath('/admin/gastos');

    return { success: true, data: gasto };
  } catch (error) {
    console.error('Erro ao atualizar status do gasto:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}
