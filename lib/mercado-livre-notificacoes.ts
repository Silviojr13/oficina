import 'server-only';
import { revalidatePath } from 'next/cache';
import prisma from './prisma';
import { ML_API, getValidAccessToken } from './mercado-livre-auth';

// Aviso que o Mercado Livre manda para /api/mercado-livre/notificacoes.
export type AvisoMercadoLivre = {
  resource?: string;
  topic?: string;
  user_id?: number | string;
  application_id?: number | string;
};

// Seguranca: o aviso nao e assinado, entao nunca se confia no conteudo dele.
// So o id do recurso e usado, e os dados sao buscados na API do Mercado
// Livre com o token da conta - um aviso falso nao cria venda nem pergunta.
async function buscarNaApi<T>(recurso: string): Promise<T> {
  const token = await getValidAccessToken();
  const res = await fetch(`${ML_API}${recurso}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Mercado Livre respondeu ${res.status} para ${recurso}`);
  return res.json() as Promise<T>;
}

export async function processarAvisoMercadoLivre(aviso: AvisoMercadoLivre) {
  const topico = String(aviso.topic ?? '');
  const recurso = String(aviso.resource ?? '');
  if (!topico || !recurso.startsWith('/')) return;

  // So aceita avisos da conta conectada.
  const conta = await prisma.mercadoLivreToken.findFirst({ orderBy: { createdAt: 'desc' } });
  if (!conta || String(aviso.user_id) !== conta.userId) return;

  const registro = await prisma.notificacaoMercadoLivre.create({ data: { topico, recurso } });
  let resultado: string;
  try {
    if (topico === 'orders_v2' || topico === 'orders') resultado = await importarVenda(recurso);
    else if (topico === 'questions') resultado = await registrarPergunta(recurso);
    else resultado = 'Tópico registrado, sem ação automática.';
  } catch (error) {
    resultado = `Erro: ${error instanceof Error ? error.message : 'desconhecido'}`;
    console.error('Erro ao processar aviso do Mercado Livre:', recurso, error);
  }
  await prisma.notificacaoMercadoLivre.update({ where: { id: registro.id }, data: { processada: true, resultado } });
}

type PedidoML = {
  id: number;
  status: string;
  date_created: string;
  date_closed?: string | null;
  total_amount: number;
  buyer?: { nickname?: string };
  order_items: { item: { id: string; title: string }; quantity: number; unit_price: number }[];
};

// Venda paga no Mercado Livre vira venda no sistema e baixa o estoque - os
// itens sao ligados pelos anuncios que o proprio sistema publicou
// (Produto.mercadoLivreId). O mesmo pedido nunca entra duas vezes.
async function importarVenda(recurso: string) {
  const pedido = await buscarNaApi<PedidoML>(recurso);
  if (pedido.status !== 'paid') return `Pedido ${pedido.id} com status "${pedido.status}" - aguardando pagamento.`;

  const numeroPedido = `ML-${pedido.id}`;
  const jaImportada = await prisma.saidaEstoque.findFirst({ where: { numeroPedido }, select: { id: true } });
  if (jaImportada) return `Pedido ${pedido.id} já importado.`;

  const anuncios = pedido.order_items.map((i) => i.item.id);
  const produtos = await prisma.produto.findMany({
    where: { mercadoLivreId: { in: anuncios } },
    select: { id: true, mercadoLivreId: true },
  });
  const porAnuncio = new Map(produtos.map((p) => [p.mercadoLivreId, p.id]));

  const itens = pedido.order_items
    .filter((i) => porAnuncio.has(i.item.id))
    .map((i) => ({
      produtoId: porAnuncio.get(i.item.id)!,
      quantidade: i.quantity,
      unidade: 'UN',
      valorUnitario: i.unit_price,
      valorTotal: i.unit_price * i.quantity,
    }));
  const semCadastro = pedido.order_items.filter((i) => !porAnuncio.has(i.item.id)).map((i) => `${i.quantity}x ${i.item.title} (${i.item.id})`);

  await prisma.$transaction([
    prisma.saidaEstoque.create({
      data: {
        tipoSaida: 'venda_mercadolivre',
        numeroPedido,
        dataHora: new Date(pedido.date_closed ?? pedido.date_created),
        cliente: pedido.buyer?.nickname ?? 'Comprador do Mercado Livre',
        vendedor: 'Mercado Livre',
        subtotal: pedido.total_amount,
        descontoTotal: 0,
        valorFinal: pedido.total_amount,
        formasPagamento: JSON.stringify(['mercado_livre']),
        observacoes: semCadastro.length ? `Itens sem produto ligado no sistema (estoque não baixado): ${semCadastro.join('; ')}` : null,
        itens: { create: itens },
      },
    }),
    ...itens.map((i) => prisma.produto.update({ where: { id: i.produtoId }, data: { estoqueAtual: { decrement: i.quantidade } } })),
  ]);

  revalidatePath('/admin/vendas');
  revalidatePath('/admin/estoque');
  return `Pedido ${pedido.id} importado como ${numeroPedido} (${itens.length} item(ns) com baixa de estoque${semCadastro.length ? `, ${semCadastro.length} sem produto ligado` : ''}).`;
}

type PerguntaML = { id: number; text: string; status: string; item_id: string; from?: { id?: number } };
type AnuncioML = { title: string; permalink: string };

// Pergunta de comprador vira mensagem em Mensagens, com o link do anuncio
// para responder la.
async function registrarPergunta(recurso: string) {
  const pergunta = await buscarNaApi<PerguntaML>(recurso);
  if (pergunta.status !== 'UNANSWERED') return `Pergunta ${pergunta.id} já respondida.`;

  const marcador = `[ML pergunta ${pergunta.id}]`;
  const existente = await prisma.mensagemContato.findFirst({ where: { mensagem: { contains: marcador } }, select: { id: true } });
  if (existente) return `Pergunta ${pergunta.id} já registrada.`;

  const anuncio = await buscarNaApi<AnuncioML>(`/items/${pergunta.item_id}`).catch(() => null);
  await prisma.mensagemContato.create({
    data: {
      nome: 'Comprador do Mercado Livre',
      email: '',
      assunto: 'mercadolivre',
      mensagem: `${pergunta.text}\n\nAnúncio: ${anuncio?.title ?? pergunta.item_id}${anuncio?.permalink ? `\nResponder no Mercado Livre: ${anuncio.permalink}` : ''}\n${marcador}`,
    },
  });
  revalidatePath('/admin/mensagens');
  return `Pergunta ${pergunta.id} registrada em Mensagens.`;
}
