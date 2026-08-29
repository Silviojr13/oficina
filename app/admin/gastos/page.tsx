'use client';

import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getGastos, createGasto, updateGasto, deleteGasto, marcarGastoComoPago } from '@/lib/actions/gastos';
import { Plus, CheckCircle, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import GastoForm from '@/components/admin/gasto-form';

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

const statusColors: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
  pago: 'default',
  pendente: 'secondary',
  atrasado: 'destructive',
};

export default function ExpensesPage() {
  const [gastos, setGastos] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editingGasto, setEditingGasto] = useState<any>(null);

  const carregar = async () => {
    const resultado = await getGastos(1, 1000);
    setGastos(resultado.data);
  };

  useEffect(() => {
    carregar();
  }, []);

  const handleOpenEdit = (gasto: any) => {
    setEditingGasto(gasto);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingGasto(null);
  };

  const handleSubmit = async (data: any) => {
    const resultado = editingGasto
      ? await updateGasto(editingGasto.id, data)
      : await createGasto(data);

    if (!resultado.success) {
      toast.error(`Erro ao salvar gasto: ${resultado.error}`);
      return;
    }

    toast.success(editingGasto ? 'Gasto atualizado com sucesso!' : 'Gasto registrado com sucesso!');
    handleCloseDialog();
    await carregar();
  };

  const handleMarcarPago = async (id: string) => {
    const resultado = await marcarGastoComoPago(id, true);
    if (!resultado.success) {
      toast.error(`Erro ao marcar como pago: ${resultado.error}`);
      return;
    }
    await carregar();
  };

  const handleDelete = async (id: string) => {
    const resultado = await deleteGasto(id);
    if (!resultado.success) {
      toast.error(`Erro ao excluir gasto: ${resultado.error}`);
      return;
    }
    await carregar();
  };

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
    <>
      <AdminHeader title="Gastos" subtitle="Contas a pagar e despesas" />
      <main className="p-4 sm:p-6 space-y-6">

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
        <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleCloseDialog())}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingGasto(null)}>
              <Plus className="mr-2 h-4 w-4" /> Novo Gasto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingGasto ? 'Editar Gasto' : 'Novo Gasto'}</DialogTitle>
            </DialogHeader>
            <GastoForm
              initialData={editingGasto}
              onSubmit={handleSubmit}
              isEditing={!!editingGasto}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
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
                    <td className="py-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          title="Marcar como pago"
                          disabled={gasto.status === 'pago'}
                          onClick={() => handleMarcarPago(gasto.id)}
                        >
                          <CheckCircle className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Pago</span>
                        </Button>
                        <Button variant="outline" size="sm" title="Editar" onClick={() => handleOpenEdit(gasto)}>
                          <Edit className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Editar</span>
                        </Button>
                        <Button variant="outline" size="sm" title="Excluir" onClick={() => handleDelete(gasto.id)}>
                          <Trash2 className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Excluir</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      </main>
    </>
  );
}
