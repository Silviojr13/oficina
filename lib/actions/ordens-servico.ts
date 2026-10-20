'use server';

import { revalidatePath } from 'next/cache';
import prisma from '../prisma';
import { parseDateFields } from '../prisma-helpers';
import { requireAdmin, requireStaff } from '../auth-guard';

async function proximoNumero() {
  const ultima = await prisma.ordemServico.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { numero: true },
  });
  const ultimoNumero = ultima ? parseInt(ultima.numero.replace('OS-', ''), 10) : 0;
  return `OS-${(ultimoNumero + 1).toString().padStart(4, '0')}`;
}

// O formulario manda [{ funcionarioId?, nome }]. Nome e obrigatorio e vira
// snapshot; funcionarioId so existe quando a pessoa veio do cadastro.
// Duplicatas (mesma pessoa marcada duas vezes) sao descartadas aqui.
function normalizarResponsaveis(responsaveis: any): { funcionarioId: string | null; nome: string }[] {
  if (!Array.isArray(responsaveis)) return [];
  const vistos = new Set<string>();
  const resultado: { funcionarioId: string | null; nome: string }[] = [];

  for (const item of responsaveis) {
    const nome = typeof item?.nome === 'string' ? item.nome.trim() : '';
    if (!nome) continue;
    const funcionarioId = item?.funcionarioId ?? null;
    const chave = funcionarioId ?? `nome:${nome.toLowerCase()}`;
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    resultado.push({ funcionarioId, nome });
  }

  return resultado;
}

function parseServicos<T extends { servicosRealizados: string | null }>(ordem: T) {
  return {
    ...ordem,
    servicosRealizados: ordem.servicosRealizados ? JSON.parse(ordem.servicosRealizados) : [],
  };
}

export async function getOrdemServico(id: string) {
  try {
    await requireStaff();
    const ordem = await prisma.ordemServico.findUnique({
      where: { id },
      include: {
        itens: { include: { produto: true } },
        responsaveis: true,
        cliente: { include: { veiculos: true } },
      },
    });
    return ordem ? parseServicos(ordem) : null;
  } catch (error) {
    console.error('Erro ao buscar ordem de serviço:', error);
    return null;
  }
}

export async function getOrdensServico(page: number = 1, limit: number = 50, search?: string) {
  try {
    await requireStaff();
    const skip = (page - 1) * limit;

    const whereClause: any = search
      ? {
          OR: [
            { placa: { contains: search } },
            { clienteNome: { contains: search } },
            { numero: { contains: search } },
          ],
        }
      : {};

    const ordens = await prisma.ordemServico.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { itens: { include: { produto: true } }, responsaveis: true },
    });

    const total = await prisma.ordemServico.count({ where: whereClause });

    return {
      data: ordens.map(parseServicos),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  } catch (error) {
    console.error('Erro ao buscar ordens de serviço:', error);
    return { data: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } };
  }
}

export async function createOrdemServico(data: any) {
  try {
    await requireStaff();
    const numero = await proximoNumero();

    const ordemData = {
      ...parseDateFields(data, ['dataEntrada', 'dataPrevisaoEntrega', 'dataSaida']),
      numero,
      servicosRealizados: data.servicosRealizados ? JSON.stringify(data.servicosRealizados) : null,
      itens: data.itens?.length ? { create: data.itens } : undefined,
      responsaveis: { create: normalizarResponsaveis(data.responsaveis) },
    };

    // As pecas usadas na OS saem do estoque - sem isso "Estoque Atual" fica
    // descolado da realidade a cada ordem de servico com pecas.
    const [ordem] = await prisma.$transaction([
      prisma.ordemServico.create({
        data: ordemData,
        include: { itens: { include: { produto: true } }, responsaveis: true },
      }),
      ...(data.itens ?? []).map((item: any) =>
        prisma.produto.update({
          where: { id: item.produtoId },
          data: { estoqueAtual: { decrement: item.quantidade } },
        })
      ),
    ]);

    revalidatePath('/admin/ordens-servico');
    revalidatePath('/admin/ordens-servico/nova');
    revalidatePath('/admin/produtos');
    revalidatePath('/admin/estoque');

    return { success: true, data: parseServicos(ordem) };
  } catch (error) {
    console.error('Erro ao criar ordem de serviço:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export async function updateOrdemServico(id: string, data: any) {
  try {
    await requireStaff();
    const { numero, ...rest } = data;

    const ordemData = {
      ...parseDateFields(rest, ['dataEntrada', 'dataPrevisaoEntrega', 'dataSaida']),
      servicosRealizados: data.servicosRealizados ? JSON.stringify(data.servicosRealizados) : null,
      ...(data.itens
        ? { itens: { deleteMany: {}, create: data.itens } }
        : {}),
      // A lista de responsaveis e sempre reescrita por inteiro quando o
      // formulario a envia - inclusive vazia, que significa "tirei todo mundo".
      ...(data.responsaveis
        ? { responsaveis: { deleteMany: {}, create: normalizarResponsaveis(data.responsaveis) } }
        : {}),
    };

    // Se a lista de pecas foi enviada, repoe o estoque das pecas antigas e
    // da baixa nas novas - senao os ajustes de uma OS editada nunca refletem
    // no estoque.
    const itensAnteriores = data.itens
      ? (await prisma.ordemServico.findUnique({ where: { id }, select: { itens: true } }))?.itens ?? []
      : [];

    const [ordem] = await prisma.$transaction([
      prisma.ordemServico.update({
        where: { id },
        data: ordemData,
        include: { itens: { include: { produto: true } }, responsaveis: true },
      }),
      ...itensAnteriores.map((item) =>
        prisma.produto.update({
          where: { id: item.produtoId },
          data: { estoqueAtual: { increment: item.quantidade } },
        })
      ),
      ...(data.itens ?? []).map((item: any) =>
        prisma.produto.update({
          where: { id: item.produtoId },
          data: { estoqueAtual: { decrement: item.quantidade } },
        })
      ),
    ]);

    revalidatePath(`/admin/ordens-servico/${id}`);
    revalidatePath('/admin/ordens-servico');
    revalidatePath('/admin/produtos');
    revalidatePath('/admin/estoque');

    return { success: true, data: parseServicos(ordem) };
  } catch (error) {
    console.error('Erro ao atualizar ordem de serviço:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export async function atualizarStatusOrdemServico(id: string, status: string) {
  try {
    await requireStaff();
    const dataExtra: Record<string, unknown> = { status };
    if (status === 'entregue') dataExtra.dataSaida = new Date();

    const ordem = await prisma.ordemServico.update({ where: { id }, data: dataExtra });
    revalidatePath('/admin/ordens-servico');
    return { success: true, data: ordem };
  } catch (error) {
    console.error('Erro ao atualizar status da ordem de serviço:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export async function deleteOrdemServico(id: string) {
  try {
    await requireAdmin();
    const ordem = await prisma.ordemServico.findUnique({ where: { id }, include: { itens: true } });
    if (!ordem) {
      return { success: false, error: 'Ordem de serviço não encontrada' };
    }

    // Cancelar a OS tem que devolver as pecas usadas ao estoque.
    await prisma.$transaction([
      prisma.ordemServico.delete({ where: { id } }),
      ...ordem.itens.map((item) =>
        prisma.produto.update({
          where: { id: item.produtoId },
          data: { estoqueAtual: { increment: item.quantidade } },
        })
      ),
    ]);

    revalidatePath('/admin/ordens-servico');
    revalidatePath('/admin/produtos');
    revalidatePath('/admin/estoque');

    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar ordem de serviço:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}
