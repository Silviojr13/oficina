'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminHeader } from '@/components/admin-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { createSaidaEstoque } from '@/lib/actions/vendas';
import { getProdutos } from '@/lib/actions/produtos';
import { toast } from 'sonner';
import type { Produto } from '@/lib/types';

type ItemVenda = {
  id: string;
  produtoId: string;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
  desconto: number;
  ipi: number;
  icms: number;
  valorTotal: number;
};

export default function NewSalePage() {
  const router = useRouter();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [tipoSaida, setTipoSaida] = useState<'venda_balcao' | 'venda_online'>('venda_balcao');
  const [cliente, setCliente] = useState('');
  const [vendedor, setVendedor] = useState('');
  const [itens, setItens] = useState<ItemVenda[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [descontoTotal, setDescontoTotal] = useState(0);
  const [valorFinal, setValorFinal] = useState(0);
  const [formasPagamento, setFormasPagamento] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    getProdutos(1, 1000).then((res) => setProdutos(res.data as unknown as Produto[]));
  }, []);

  const addItem = (produtoId: string, quantidade: number) => {
    const produto = produtos.find(p => p.id === produtoId);
    if (!produto) return;

    const valorUnitario = produto.precoVendaBalcao || produto.precoSite;
    const newItem: ItemVenda = {
      id: `item_${Date.now()}`,
      produtoId,
      quantidade,
      unidade: 'UN',
      valorUnitario,
      desconto: 0,
      ipi: 0,
      icms: 0,
      valorTotal: valorUnitario * quantidade,
    };

    const novosItens = [...itens, newItem];
    setItens(novosItens);
    calculateTotals(novosItens);
  };

  const removeItem = (itemId: string) => {
    const newItens = itens.filter(item => item.id !== itemId);
    setItens(newItens);
    calculateTotals(newItens);
  };

  const calculateTotals = (currentItens: ItemVenda[]) => {
    const sub = currentItens.reduce((sum, item) => sum + item.valorTotal, 0);
    const valFin = sub - descontoTotal;
    setSubtotal(sub);
    setValorFinal(valFin);
  };

  const toggleFormaPagamento = (forma: string) => {
    setFormasPagamento(prev =>
      prev.includes(forma) ? prev.filter(f => f !== forma) : [...prev, forma]
    );
  };

  const handleSubmit = async () => {
    if (itens.length === 0) {
      toast.error('A venda deve conter pelo menos um item.');
      return;
    }
    if (!cliente) {
      toast.error('Informe o cliente.');
      return;
    }

    setEnviando(true);
    const resultado = await createSaidaEstoque({
      tipoSaida,
      dataHora: new Date().toISOString(),
      cliente,
      cpfCnpjCliente: '',
      vendedor,
      itens: itens.map(({ id, ...item }) => item),
      subtotal,
      descontoTotal,
      valorFinal,
      formasPagamento,
      troco: 0,
      observacoes: '',
      emitirNFe: false,
      imprimirCupom: false,
    });
    setEnviando(false);

    if (!resultado.success) {
      toast.error(`Erro ao registrar venda: ${resultado.error}`);
      return;
    }

    toast.success(`Venda ${resultado.data?.numeroPedido} registrada com sucesso!`);
    router.push('/admin/vendas');
  };

  return (
    <>
      <AdminHeader title="Nova Venda" subtitle="Registrar uma nova transação de venda" />
      <main className="p-4 sm:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dados da Venda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Tipo de Saída</Label>
              <Select value={tipoSaida} onValueChange={(v) => setTipoSaida(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="venda_balcao">Venda Balcão</SelectItem>
                  <SelectItem value="venda_online">Venda Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cliente</Label>
              <Input value={cliente} onChange={(e) => setCliente(e.target.value)} />
            </div>
            <div>
              <Label>Vendedor</Label>
              <Input value={vendedor} onChange={(e) => setVendedor(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Adicionar Itens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Selecionar Produto</Label>
              <Select onValueChange={(pid) => addItem(pid, 1)}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um produto" />
                </SelectTrigger>
                <SelectContent>
                  {produtos.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.nome} (R$ {(p.precoVendaBalcao || p.precoSite).toFixed(2)})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left">Produto</th>
                  <th className="py-2 text-left">Quantidade</th>
                  <th className="py-2 text-left">Valor Unit.</th>
                  <th className="py-2 text-left">Desconto</th>
                  <th className="py-2 text-left">Valor Total</th>
                  <th className="py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {itens.map(item => {
                  const produto = produtos.find(p => p.id === item.produtoId);
                  return (
                    <tr key={item.id} className="border-b">
                      <td className="py-2">{produto?.nome}</td>
                      <td className="py-2">{item.quantidade}</td>
                      <td className="py-2">R$ {item.valorUnitario.toFixed(2).replace('.', ',')}</td>
                      <td className="py-2">R$ {item.desconto.toFixed(2).replace('.', ',')}</td>
                      <td className="py-2">R$ {item.valorTotal.toFixed(2).replace('.', ',')}</td>
                      <td className="py-2">
                        <Button variant="outline" size="sm" onClick={() => removeItem(item.id)}>Remover</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumo e Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Subtotal</Label>
              <div className="text-xl font-bold">R$ {subtotal.toFixed(2).replace('.', ',')}</div>
            </div>
            <div>
              <Label>Desconto Total</Label>
              <div className="text-xl font-bold">R$ {descontoTotal.toFixed(2).replace('.', ',')}</div>
            </div>
            <div>
              <Label>Valor Final</Label>
              <div className="text-xl font-bold">R$ {valorFinal.toFixed(2).replace('.', ',')}</div>
            </div>
          </div>

          <div>
            <Label>Formas de Pagamento</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {['Dinheiro', 'PIX', 'Cartão de Débito', 'Cartão de Crédito', 'Boleto'].map(forma => (
                <Button
                  key={forma}
                  type="button"
                  variant={formasPagamento.includes(forma) ? "default" : "outline"}
                  onClick={() => toggleFormaPagamento(forma)}
                >
                  {forma}
                </Button>
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={handleSubmit} disabled={enviando}>
            {enviando ? 'Registrando...' : 'Finalizar Venda'}
          </Button>
        </CardContent>
      </Card>
      </main>
    </>
  );
}
