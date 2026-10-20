'use server';

import { revalidatePath } from 'next/cache';
import prisma from '../prisma';
import { parseDateFields } from '../prisma-helpers';
import { requireAdmin, requireStaff } from '../auth-guard';

// Lista enxuta pro seletor de responsaveis da OS. Diferente de getFuncionarios,
// que e so admin: qualquer pessoa da equipe precisa conseguir marcar quem
// trabalhou numa OS, entao aqui e requireStaff e so vao os campos que o
// seletor mostra - nada de salario, CPF ou endereco.
export async function listarEquipeAtiva() {
  try {
    await requireStaff();
    return await prisma.funcionario.findMany({
      where: { status: 'ativo' },
      orderBy: { nome: 'asc' },
      select: { id: true, nome: true, cargo: true, setor: true },
    });
  } catch (error) {
    console.error('Erro ao listar equipe ativa:', error);
    return [];
  }
}

export async function getFuncionario(id: string) {
  try {
    await requireAdmin();
    const funcionario = await prisma.funcionario.findUnique({
      where: { id },
    });

    return funcionario;
  } catch (error) {
    console.error('Erro ao buscar funcionário:', error);
    return null;
  }
}

export async function getFuncionarios(page: number = 1, limit: number = 10, search?: string) {
  try {
    await requireAdmin();
    const skip = (page - 1) * limit;

    let whereClause: any = {};
    if (search) {
      whereClause.nome = {
        contains: search,
      };
    }

    const funcionarios = await prisma.funcionario.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.funcionario.count({
      where: whereClause,
    });

    return {
      data: funcionarios,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Erro ao buscar funcionários:', error);
    return { data: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } };
  }
}

export async function createFuncionario(data: any) {
  try {
    await requireAdmin();
    const funcionario = await prisma.funcionario.create({
      data: parseDateFields(data, ['dataAdmissao', 'dataDemissao']),
    });

    revalidatePath('/admin/funcionarios');
    revalidatePath('/admin/funcionarios/novo');

    return { success: true, data: funcionario };
  } catch (error) {
    console.error('Erro ao criar funcionário:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export async function updateFuncionario(id: string, data: any) {
  try {
    await requireAdmin();
    const funcionario = await prisma.funcionario.update({
      where: { id },
      data: parseDateFields(data, ['dataAdmissao', 'dataDemissao']),
    });

    revalidatePath(`/admin/funcionarios/${id}`);
    revalidatePath('/admin/funcionarios');

    return { success: true, data: funcionario };
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export async function deleteFuncionario(id: string) {
  try {
    await requireAdmin();
    await prisma.funcionario.delete({
      where: { id },
    });

    revalidatePath('/admin/funcionarios');

    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar funcionário:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}
