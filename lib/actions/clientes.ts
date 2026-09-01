'use server';

import { revalidatePath } from 'next/cache';
import prisma from '../prisma';
import { requireStaff, requireAdmin } from '../auth-guard';

export async function getClientes(page: number = 1, limit: number = 20, search?: string) {
  try {
    await requireStaff();
    const skip = (page - 1) * limit;

    const whereClause: any = search
      ? {
          OR: [
            { nome: { contains: search } },
            { telefone: { contains: search } },
            { cpfCnpj: { contains: search } },
          ],
        }
      : {};

    const clientes = await prisma.cliente.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { nome: 'asc' },
      include: { veiculos: true },
    });

    const total = await prisma.cliente.count({ where: whereClause });

    return { data: clientes, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return { data: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } };
  }
}

// Busca rapida pro autocomplete do formulario de OS - por nome, telefone ou
// placa de um veiculo vinculado. Sem paginacao, so os melhores resultados.
export async function searchClientes(termo: string) {
  try {
    await requireStaff();
    if (!termo || termo.trim().length < 2) return [];

    const clientes = await prisma.cliente.findMany({
      where: {
        OR: [
          { nome: { contains: termo } },
          { telefone: { contains: termo } },
          { veiculos: { some: { placa: { contains: termo } } } },
        ],
      },
      include: { veiculos: true },
      take: 8,
      orderBy: { nome: 'asc' },
    });

    return clientes;
  } catch (error) {
    console.error('Erro ao buscar clientes (autocomplete):', error);
    return [];
  }
}

export async function getCliente(id: string) {
  try {
    await requireStaff();
    return await prisma.cliente.findUnique({ where: { id }, include: { veiculos: true } });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return null;
  }
}

// Historico de OS por placa - busca tanto pelo veiculo vinculado quanto pelo
// texto avulso (registros antigos, criados antes do cadastro existir, so
// tem o texto). Usado no formulario de OS pra mostrar visitas anteriores.
export async function getHistoricoPorPlaca(placa: string) {
  try {
    await requireStaff();
    if (!placa) return [];

    const placaNormalizada = placa.trim().toUpperCase();
    if (!placaNormalizada) return [];

    return await prisma.ordemServico.findMany({
      where: {
        OR: [
          { placa: { equals: placaNormalizada } },
          { veiculo: { placa: { equals: placaNormalizada } } },
        ],
      },
      orderBy: { dataEntrada: 'desc' },
      select: {
        id: true,
        numero: true,
        dataEntrada: true,
        status: true,
        problemaRelatado: true,
        kmEntrada: true,
        valorTotal: true,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar histórico por placa:', error);
    return [];
  }
}

export async function createCliente(data: {
  nome: string;
  telefone?: string;
  cpfCnpj?: string;
  email?: string;
  veiculos?: { placa: string; marca?: string; modelo?: string; ano?: number; cor?: string }[];
}) {
  try {
    await requireStaff();
    const { veiculos, ...clienteData } = data;

    const cliente = await prisma.cliente.create({
      data: {
        ...clienteData,
        veiculos: veiculos?.length ? { create: veiculos } : undefined,
      },
      include: { veiculos: true },
    });

    revalidatePath('/admin/clientes');
    return { success: true, data: cliente };
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export async function updateCliente(
  id: string,
  data: { nome: string; telefone?: string; cpfCnpj?: string; email?: string }
) {
  try {
    await requireStaff();
    const cliente = await prisma.cliente.update({ where: { id }, data });

    revalidatePath('/admin/clientes');
    return { success: true, data: cliente };
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export async function deleteCliente(id: string) {
  try {
    await requireAdmin();
    await prisma.cliente.delete({ where: { id } });

    revalidatePath('/admin/clientes');
    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';
    if (mensagem.includes('FOREIGN KEY constraint failed')) {
      return {
        success: false,
        error: 'Este cliente já tem ordens de serviço vinculadas e não pode ser excluído.',
      };
    }
    return { success: false, error: mensagem };
  }
}

export async function createVeiculo(
  clienteId: string,
  data: { placa: string; marca?: string; modelo?: string; ano?: number; cor?: string }
) {
  try {
    await requireStaff();
    const veiculo = await prisma.veiculo.create({ data: { ...data, clienteId } });

    revalidatePath('/admin/clientes');
    return { success: true, data: veiculo };
  } catch (error) {
    console.error('Erro ao criar veículo:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export async function updateVeiculo(
  id: string,
  data: { placa: string; marca?: string; modelo?: string; ano?: number; cor?: string }
) {
  try {
    await requireStaff();
    const veiculo = await prisma.veiculo.update({ where: { id }, data });

    revalidatePath('/admin/clientes');
    return { success: true, data: veiculo };
  } catch (error) {
    console.error('Erro ao atualizar veículo:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export async function deleteVeiculo(id: string) {
  try {
    await requireStaff();
    await prisma.veiculo.delete({ where: { id } });

    revalidatePath('/admin/clientes');
    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar veículo:', error);
    const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';
    if (mensagem.includes('FOREIGN KEY constraint failed')) {
      return {
        success: false,
        error: 'Este veículo já tem ordens de serviço vinculadas e não pode ser excluído.',
      };
    }
    return { success: false, error: mensagem };
  }
}
