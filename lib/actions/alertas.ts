'use server';

import prisma from '../prisma';
import { requireStaff } from '../auth-guard';

// Contagens do sino do topo do painel. Antes o sino mostrava 3 avisos
// escritos no codigo ("Pedido #1255", "NF Bosch..."), que nunca mudavam.
export async function getAlertasPainel() {
  try {
    await requireStaff();
    const [mensagensNaoLidas, estoques, aguardandoPeca] = await Promise.all([
      prisma.mensagemContato.count({ where: { lida: false } }),
      // O Prisma nao compara duas colunas no where (estoqueAtual <= estoqueMinimo),
      // entao busca so os dois numeros e filtra aqui - mesma regra do dashboard.
      prisma.produto.findMany({ select: { estoqueAtual: true, estoqueMinimo: true } }),
      prisma.ordemServico.count({ where: { status: 'aguardando_peca' } }),
    ]);
    const estoqueBaixo = estoques.filter((p) => p.estoqueAtual <= (p.estoqueMinimo ?? 0)).length;
    return { mensagensNaoLidas, estoqueBaixo, aguardandoPeca };
  } catch (error) {
    console.error('Erro ao buscar alertas do painel:', error);
    return { mensagensNaoLidas: 0, estoqueBaixo: 0, aguardandoPeca: 0 };
  }
}
