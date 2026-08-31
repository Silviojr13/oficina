'use server';

import { revalidatePath } from 'next/cache';
import prisma from '../prisma';
import { parseDateFields } from '../prisma-helpers';

export async function getSaidaEstoque(id: string) {
  try {
    const venda = await prisma.saidaEstoque.findUnique({
      where: { id },
      include: {
        itens: {
          include: {
            produto: true, // Include product info for each item
          }
        }
      },
    });

    if (!venda) {
      return null;
    }

    // Parse JSON fields
    return {
      ...venda,
      formasPagamento: venda.formasPagamento ? JSON.parse(venda.formasPagamento as string) : [],
      // itens are already included with produto relation
    };
  } catch (error) {
    console.error('Erro ao buscar venda:', error);
    return null;
  }
}

export async function getSaidasEstoque(page: number = 1, limit: number = 10, search?: string) {
  try {
    const skip = (page - 1) * limit;

    let whereClause: any = {};
    if (search) {
      // Search by client name or numberPedido
      whereClause.OR = [
        { cliente: { contains: search, mode: 'insensitive' } },
        { numeroPedido: { contains: search, mode: 'insensitive' } },
      ];
    }

    const vendas = await prisma.saidaEstoque.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { dataHora: 'desc' }, // Order by date/time of sale
      include: {
        itens: {
          include: {
            produto: true, // Include product info for each item
          }
        }
      },
    });

    const total = await prisma.saidaEstoque.count({
      where: whereClause,
    });

    // Parse JSON fields for each venda
    const parsedVendas = vendas.map(venda => ({
      ...venda,
      formasPagamento: venda.formasPagamento ? JSON.parse(venda.formasPagamento as string) : [],
    }));

    return {
      data: parsedVendas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    return { data: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } };
  }
}

async function proximoNumeroPedido() {
  const ultima = await prisma.saidaEstoque.findFirst({
    orderBy: { createdAt: 'desc' },
    where: { numeroPedido: { not: null } },
    select: { numeroPedido: true },
  });
  const ultimoNumero = ultima?.numeroPedido ? parseInt(ultima.numeroPedido.replace('PED-', ''), 10) || 0 : 0;
  return `PED-${(ultimoNumero + 1).toString().padStart(3, '0')}`;
}

export async function createSaidaEstoque(data: any) {
  try {
    const numeroPedido = data.numeroPedido || (await proximoNumeroPedido());
    const vendaData = {
      ...parseDateFields(data, ['dataHora']),
      numeroPedido,
      formasPagamento: data.formasPagamento ? JSON.stringify(data.formasPagamento) : null,
      itens: {
        create: data.itens.map((item: any) => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          unidade: item.unidade,
          valorUnitario: item.valorUnitario,
          desconto: item.desconto,
          ipi: item.ipi,
          icms: item.icms,
          valorTotal: item.valorTotal,
        })),
      },
    };

    // Uma venda precisa dar baixa no estoque dos produtos vendidos - sem isso
    // "Estoque Atual" fica descolado da realidade a cada venda registrada.
    // Tudo numa transacao pra nao debitar estoque se a venda falhar (ou vice-versa).
    const [venda] = await prisma.$transaction([
      prisma.saidaEstoque.create({
        data: vendaData,
        include: {
          itens: {
            include: {
              produto: true,
            }
          }
        },
      }),
      ...data.itens.map((item: any) =>
        prisma.produto.update({
          where: { id: item.produtoId },
          data: { estoqueAtual: { decrement: item.quantidade } },
        })
      ),
    ]);

    revalidatePath('/admin/vendas');
    revalidatePath('/admin/vendas/nova');
    revalidatePath('/admin/produtos');
    revalidatePath('/admin/estoque');

    return { success: true, data: venda };
  } catch (error) {
    console.error('Erro ao criar venda:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export async function updateSaidaEstoque(id: string, data: any) {
  try {
    const vendaAnterior = await prisma.saidaEstoque.findUnique({
      where: { id },
      include: { itens: true },
    });
    if (!vendaAnterior) {
      return { success: false, error: 'Venda não encontrada' };
    }

    const vendaData = {
      ...parseDateFields(data, ['dataHora']),
      formasPagamento: data.formasPagamento ? JSON.stringify(data.formasPagamento) : null,
      itens: {
        deleteMany: {}, // Delete old items
        create: data.itens, // Create new items
      },
    };

    // Repõe o estoque dos itens antigos e da baixa nos itens novos, senao os
    // ajustes de uma venda editada nunca refletem no estoque. A venda fica
    // sempre em primeiro no array pra destructuring pegar o resultado certo -
    // a ordem entre increment/decrement de produtos diferentes nao importa,
    // sao operacoes atomicas independentes dentro da mesma transacao.
    const [venda] = await prisma.$transaction([
      prisma.saidaEstoque.update({
        where: { id },
        data: vendaData,
        include: {
          itens: {
            include: {
              produto: true,
            }
          }
        },
      }),
      ...vendaAnterior.itens.map((item) =>
        prisma.produto.update({
          where: { id: item.produtoId },
          data: { estoqueAtual: { increment: item.quantidade } },
        })
      ),
      ...data.itens.map((item: any) =>
        prisma.produto.update({
          where: { id: item.produtoId },
          data: { estoqueAtual: { decrement: item.quantidade } },
        })
      ),
    ]);

    revalidatePath(`/admin/vendas/${id}`);
    revalidatePath('/admin/vendas');
    revalidatePath('/admin/produtos');
    revalidatePath('/admin/estoque');

    return { success: true, data: venda };
  } catch (error) {
    console.error('Erro ao atualizar venda:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export async function deleteSaidaEstoque(id: string) {
  try {
    const venda = await prisma.saidaEstoque.findUnique({
      where: { id },
      include: { itens: true },
    });
    if (!venda) {
      return { success: false, error: 'Venda não encontrada' };
    }

    // Cancelar a venda tem que devolver a mercadoria ao estoque.
    await prisma.$transaction([
      prisma.saidaEstoque.delete({ where: { id } }),
      ...venda.itens.map((item) =>
        prisma.produto.update({
          where: { id: item.produtoId },
          data: { estoqueAtual: { increment: item.quantidade } },
        })
      ),
    ]);

    revalidatePath('/admin/vendas');
    revalidatePath('/admin/produtos');
    revalidatePath('/admin/estoque');

    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar venda:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

// Action to mark a sale as paid (might be applicable depending on business logic)
// For simplicity, assuming status change logic could be here if needed.
// Many sales systems consider 'completed' or 'paid' upon creation if payment is immediate.
// This is a placeholder if such state management is required.
// export async function marcarVendaComoPaga(id: string) {
//   // Implementation would depend on specific status field and logic
//   // Example: update status in SaidaEstoque
// }