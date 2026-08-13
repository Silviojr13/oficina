'use client';

import { AdminHeader } from '@/components/admin-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useVendaStore } from '@/lib/admin-store';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

export default function SalesListPage() {
  const router = useRouter();
  const { vendas } = useVendaStore();

  // Calculating KPIs
  const today = new Date().toISOString().split('T')[0];
  const vendasHoje = vendas.filter(v => v.dataHora.startsWith(today));
  const totalVendasHoje = vendasHoje.reduce((sum, v) => sum + v.valorFinal, 0);
  const totalVendasMes = vendas.reduce((sum, v) => sum + v.valorFinal, 0);
  const ticketMedio = vendas.length > 0 ? totalVendasMes / vendas.length : 0;

  return (
    <div className="space-y-6">
      <AdminHeader title="Vendas" subtitle="Controle de vendas e pedidos" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalVendasHoje.toFixed(2).replace('.', ',')}</div>
            <div className="text-xs text-muted-foreground">{vendasHoje.length} pedidos</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalVendasMes.toFixed(2).replace('.', ',')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {ticketMedio.toFixed(2).replace('.', ',')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendas.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => router.push('/admin/vendas/nova')}>
          <Plus className="mr-2 h-4 w-4" /> Nova Venda
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left">Nº Pedido</th>
                  <th className="py-2 text-left">Data/Hora</th>
                  <th className="py-2 text-left">Cliente</th>
                  <th className="py-2 text-left">Vendedor</th>
                  <th className="py-2 text-left">Qtd. Itens</th>
                  <th className="py-2 text-left">Valor Final</th>
                  <th className="py-2 text-left">Forma(s) Pagamento</th>
                  <th className="py-2 text-left">Tipo</th>
                  <th className="py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {vendas.map((venda) => (
                  <tr key={venda.id} className="border-b">
                    <td className="py-2 font-mono">{venda.numeroPedido}</td>
                    <td className="py-2">{new Date(venda.dataHora).toLocaleString('pt-BR')}</td>
                    <td className="py-2">{venda.cliente}</td>
                    <td className="py-2">{venda.vendedor}</td>
                    <td className="py-2">{venda.itens.reduce((acc, item) => acc + item.quantidade, 0)}</td>
                    <td className="py-2">R$ {venda.valorFinal.toFixed(2).replace('.', ',')}</td>
                    <td className="py-2">{venda.formasPagamento.join(', ')}</td>
                    <td className="py-2">
                      <Badge variant={venda.tipoSaida === 'venda_balcao' ? 'default' : 'secondary'}>
                        {venda.tipoSaida === 'venda_balcao' ? 'Venda Balcão' : 'Venda Online'}
                      </Badge>
                    </td>
                    <td className="py-2">
                      <Button variant="outline" size="sm">Detalhes</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}