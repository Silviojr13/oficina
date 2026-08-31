'use server';

import prisma from '../prisma';
import { requireAdmin } from '../auth-guard';

function inicioDoDia(data: Date) {
  const d = new Date(data);
  d.setHours(0, 0, 0, 0);
  return d;
}

function inicioDoMes(data: Date) {
  return new Date(data.getFullYear(), data.getMonth(), 1);
}

export async function getDashboardKPIs() {
  try {
    await requireAdmin();
    const agora = new Date();
    const hoje = inicioDoDia(agora);
    const inicioMesAtual = inicioDoMes(agora);
    const inicioMesAnterior = new Date(inicioMesAtual.getFullYear(), inicioMesAtual.getMonth() - 1, 1);

    const [vendasHojeAgg, vendasMesAgg, vendasMesAnteriorAgg, produtosEstoque, contasAPagar] = await Promise.all([
      prisma.saidaEstoque.aggregate({
        where: { dataHora: { gte: hoje } },
        _sum: { valorFinal: true },
        _count: true,
      }),
      prisma.saidaEstoque.findMany({
        where: { dataHora: { gte: inicioMesAtual } },
        select: { valorFinal: true, itens: { select: { quantidade: true, produto: { select: { custoTotal: true } } } } },
      }),
      prisma.saidaEstoque.aggregate({
        where: { dataHora: { gte: inicioMesAnterior, lt: inicioMesAtual } },
        _sum: { valorFinal: true },
      }),
      prisma.produto.findMany({ select: { estoqueAtual: true, estoqueMinimo: true } }),
      prisma.gasto.aggregate({
        where: {
          status: { in: ['pendente', 'atrasado'] },
          dataVencimento: { lte: new Date(agora.getTime() + 7 * 24 * 60 * 60 * 1000) },
        },
        _sum: { valor: true },
      }),
    ]);

    const produtosEmFalta = produtosEstoque.filter((p) => p.estoqueAtual <= (p.estoqueMinimo ?? 0)).length;

    const vendasMes = vendasMesAgg.reduce((sum, v) => sum + (v.valorFinal ?? 0), 0);
    const pedidosMes = vendasMesAgg.length;
    const cmvMes = vendasMesAgg.reduce(
      (sum, v) => sum + v.itens.reduce((s, item) => s + item.quantidade * (item.produto?.custoTotal ?? 0), 0),
      0
    );
    const vendasMesAnterior = vendasMesAnteriorAgg._sum.valorFinal ?? 0;
    const variacaoMes = vendasMesAnterior > 0 ? ((vendasMes - vendasMesAnterior) / vendasMesAnterior) * 100 : 0;
    const margemBruta = vendasMes > 0 ? ((vendasMes - cmvMes) / vendasMes) * 100 : 0;

    return {
      vendasHoje: vendasHojeAgg._sum.valorFinal ?? 0,
      pedidosHoje: vendasHojeAgg._count,
      vendasMes,
      variacaoMes: Math.round(variacaoMes * 10) / 10,
      ticketMedio: pedidosMes > 0 ? vendasMes / pedidosMes : 0,
      produtosEmFalta,
      contasAPagar: contasAPagar._sum.valor ?? 0,
      cmvMes,
      margemBruta: Math.round(margemBruta * 10) / 10,
    };
  } catch (error) {
    console.error('Erro ao calcular KPIs do dashboard:', error);
    return {
      vendasHoje: 0, pedidosHoje: 0, vendasMes: 0, variacaoMes: 0, ticketMedio: 0,
      produtosEmFalta: 0, contasAPagar: 0, cmvMes: 0, margemBruta: 0,
    };
  }
}

export async function getVendasUltimosDias(dias: number = 30) {
  try {
    await requireAdmin();
    const desde = new Date();
    desde.setDate(desde.getDate() - dias);
    desde.setHours(0, 0, 0, 0);

    const vendas = await prisma.saidaEstoque.findMany({
      where: { dataHora: { gte: desde } },
      select: { dataHora: true, valorFinal: true },
    });

    const porDia = new Map<string, number>();
    for (let i = 0; i < dias; i++) {
      const d = new Date(desde);
      d.setDate(d.getDate() + i);
      porDia.set(d.toISOString().slice(0, 10), 0);
    }
    for (const venda of vendas) {
      const chave = new Date(venda.dataHora).toISOString().slice(0, 10);
      porDia.set(chave, (porDia.get(chave) ?? 0) + (venda.valorFinal ?? 0));
    }

    return Array.from(porDia.entries()).map(([data, valor]) => ({
      data: new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      valor,
    }));
  } catch (error) {
    console.error('Erro ao buscar vendas dos últimos dias:', error);
    return [];
  }
}

export async function getTopProdutosMes(limite: number = 10) {
  try {
    await requireAdmin();
    const inicioMesAtual = inicioDoMes(new Date());

    const itens = await prisma.itemMovimentacao_saida.findMany({
      where: { saida: { dataHora: { gte: inicioMesAtual } } },
      select: { quantidade: true, valorTotal: true, produto: { select: { id: true, nome: true } } },
    });

    const porProduto = new Map<string, { nome: string; quantidade: number; valor: number }>();
    for (const item of itens) {
      const atual = porProduto.get(item.produto.id) ?? { nome: item.produto.nome, quantidade: 0, valor: 0 };
      atual.quantidade += item.quantidade;
      atual.valor += item.valorTotal;
      porProduto.set(item.produto.id, atual);
    }

    return Array.from(porProduto.values())
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, limite);
  } catch (error) {
    console.error('Erro ao buscar top produtos do mês:', error);
    return [];
  }
}

const CORES_CATEGORIA = ['#F97316', '#22C55E', '#3B82F6', '#EAB308', '#8B5CF6', '#6B7280', '#EC4899', '#14B8A6'];

export async function getVendasPorCategoria() {
  try {
    await requireAdmin();
    const inicioMesAtual = inicioDoMes(new Date());

    const itens = await prisma.itemMovimentacao_saida.findMany({
      where: { saida: { dataHora: { gte: inicioMesAtual } } },
      select: { valorTotal: true, produto: { select: { categoria: true } } },
    });

    const porCategoria = new Map<string, number>();
    for (const item of itens) {
      porCategoria.set(item.produto.categoria, (porCategoria.get(item.produto.categoria) ?? 0) + item.valorTotal);
    }

    return Array.from(porCategoria.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([categoria, valor], index) => ({ categoria, valor, cor: CORES_CATEGORIA[index % CORES_CATEGORIA.length] }));
  } catch (error) {
    console.error('Erro ao buscar vendas por categoria:', error);
    return [];
  }
}

export async function getMovimentacoesRecentes(limite: number = 8) {
  try {
    await requireAdmin();
    const [vendas, entradas] = await Promise.all([
      prisma.saidaEstoque.findMany({
        orderBy: { dataHora: 'desc' },
        take: limite,
        include: { itens: true },
      }),
      prisma.entradaEstoque.findMany({
        orderBy: { dataEntrada: 'desc' },
        take: limite,
        include: { itens: true, fornecedor: true },
      }),
    ]);

    const movimentacoes = [
      ...vendas.map((v) => ({
        id: v.id,
        tipo: 'saida' as const,
        descricao: `Venda ${v.numeroPedido ?? ''} - ${v.cliente ?? 'Cliente não identificado'}`,
        quantidade: v.itens.reduce((sum, i) => sum + i.quantidade, 0),
        valor: v.valorFinal ?? 0,
        data: v.dataHora,
        status: 'concluido' as const,
      })),
      ...entradas.map((e) => ({
        id: e.id,
        tipo: 'entrada' as const,
        descricao: `Entrada NF ${e.numeroNF} - ${e.fornecedor?.nomeFantasia ?? 'Fornecedor'}`,
        quantidade: e.itens.reduce((sum, i) => sum + i.quantidade, 0),
        valor: e.valorTotal ?? 0,
        data: e.dataEntrada,
        status: 'concluido' as const,
      })),
    ];

    return movimentacoes
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, limite);
  } catch (error) {
    console.error('Erro ao buscar movimentações recentes:', error);
    return [];
  }
}
