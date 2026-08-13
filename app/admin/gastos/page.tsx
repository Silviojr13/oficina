'use client';

import { AdminHeader } from '@/components/admin-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useGastoStore } from '@/lib/admin-store';
import { useState } from 'react';
import { Plus, CheckCircle, Edit, Trash2 } from 'lucide-react';

// Define the expense categories and statuses for consistent mapping
const categoriaLabels: Record<string, string> = {
  aluguel: 'Aluguel',
  salarios: 'Salários',
  fornecedores: 'Fornecedores',
  energia: 'Energia',
  agua: 'Água',
  internet: 'Internet',
  manutencao: 'Manutenção',
  marketing: 'Marketing',
  impostos: 'Impostos',
  transporte: 'Transporte',
  outros: 'Outros',
};

const statusColors: Record<string, string> = {
  pago: 'success',
  pendente: 'secondary',
  atrasado: 'destructive',
};

export default function ExpensesPage() {
  const { gastos, marcarComoPago, deleteGasto } = useGastoStore();
  const [open, setOpen] = useState(false);

  // Calculate KPIs
  const totalPagoMes = gastos
    .filter(g => g.status === 'pago')
    .reduce((sum, g) => sum + g.valor, 0);

  const totalPendente = gastos
    .filter(g => g.status === 'pendente')
    .reduce((sum, g) => sum + g.valor, 0);

  const totalAtrasado = gastos
    .filter(g => g.status === 'atrasado' || (g.status === 'pendente' && new Date(g.dataVencimento) < new Date()))
    .reduce((sum, g) => sum + g.valor, 0);

  return (
    <div className="space-y-6">
      <AdminHeader title="Gastos" subtitle="Contas a pagar e despesas" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Pago (Mês)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalPagoMes.toFixed(2).replace('.', ',')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalPendente.toFixed(2).replace('.', ',')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Atrasado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalAtrasado.toFixed(2).replace('.', ',')}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Novo Gasto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Gasto</DialogTitle>
            </DialogHeader>
            <p>Formulário de cadastro de gasto irá aqui...</p>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left">Descrição</th>
                  <th className="py-2 text-left">Categoria</th>
                  <th className="py-2 text-left">Valor</th>
                  <th className="py-2 text-left">Vencimento</th>
                  <th className="py-2 text-left">Status</th>
                  <th className="py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {gastos.map((gasto) => (
                  <tr key={gasto.id} className="border-b">
                    <td className="py-2">{gasto.descricao}</td>
                    <td className="py-2">
                      <Badge variant="outline">{categoriaLabels[gasto.categoria]}</Badge>
                    </td>
                    <td className="py-2">R$ {gasto.valor.toFixed(2).replace('.', ',')}</td>
                    <td className="py-2">{new Date(gasto.dataVencimento).toLocaleDateString('pt-BR')}</td>
                    <td className="py-2">
                      <Badge variant={statusColors[gasto.status]}>
                        {gasto.status.charAt(0).toUpperCase() + gasto.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-2 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={gasto.status === 'pago'}
                        onClick={() => marcarComoPago(gasto.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" /> Pago
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" /> Editar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteGasto(gasto.id)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Excluir
                      </Button>
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