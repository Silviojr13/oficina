'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AdminHeader } from '@/components/admin-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { getOrdensServico, deleteOrdemServico, atualizarStatusOrdemServico } from '@/lib/actions/ordens-servico';

const statusLabels: Record<string, string> = {
  aberto: 'Aberta',
  em_andamento: 'Em andamento',
  aguardando_peca: 'Aguardando peça',
  aguardando_aprovacao: 'Aguardando aprovação',
  concluido: 'Concluída',
  entregue: 'Entregue',
  cancelado: 'Cancelada',
};

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  aberto: 'outline',
  em_andamento: 'secondary',
  aguardando_peca: 'secondary',
  aguardando_aprovacao: 'secondary',
  concluido: 'default',
  entregue: 'default',
  cancelado: 'destructive',
};

export default function OrdensServicoPage() {
  const router = useRouter();
  const [ordens, setOrdens] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [ordemParaExcluir, setOrdemParaExcluir] = useState<string | null>(null);

  const carregar = async () => {
    const resultado = await getOrdensServico(1, 1000, searchTerm || undefined);
    setOrdens(resultado.data);
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const ordensFiltradas = ordens.filter((o) => !statusFiltro || o.status === statusFiltro);
  const abertas = ordens.filter((o) => !['entregue', 'cancelado'].includes(o.status)).length;
  const faturamentoPatio = ordens
    .filter((o) => !['cancelado'].includes(o.status))
    .reduce((sum, o) => sum + o.valorTotal, 0);

  const handleExcluir = async () => {
    if (!ordemParaExcluir) return;
    const resultado = await deleteOrdemServico(ordemParaExcluir);
    if (!resultado.success) toast.error(`Erro ao excluir: ${resultado.error}`);
    else await carregar();
    setOrdemParaExcluir(null);
  };

  const handleStatusChange = async (id: string, status: string) => {
    const resultado = await atualizarStatusOrdemServico(id, status);
    if (!resultado.success) toast.error(`Erro ao atualizar status: ${resultado.error}`);
    else await carregar();
  };

  return (
    <div className="space-y-6">
      <AdminHeader title="Ordens de Serviço" subtitle="Veículos em atendimento na oficina" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">No pátio</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{abertas}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total de OS</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{ordens.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Valor em OS ativas</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">R$ {faturamentoPatio.toFixed(2).replace('.', ',')}</div></CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Buscar por placa, cliente ou número..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
        </div>
        <Select value={statusFiltro} onValueChange={setStatusFiltro}>
          <SelectTrigger className="w-full sm:w-[220px]"><SelectValue placeholder="Filtrar por status" /></SelectTrigger>
          <SelectContent>
            {Object.entries(statusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => router.push('/admin/ordens-servico/nova')}>
          <Plus className="mr-2 h-4 w-4" /> Nova Ordem de Serviço
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Ordens de Serviço</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left">Número</th>
                  <th className="py-2 text-left">Placa</th>
                  <th className="py-2 text-left">Veículo</th>
                  <th className="py-2 text-left">Cliente</th>
                  <th className="py-2 text-left">Entrada</th>
                  <th className="py-2 text-left">Total</th>
                  <th className="py-2 text-left">Status</th>
                  <th className="py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {ordensFiltradas.map((ordem) => (
                  <tr key={ordem.id} className="border-b">
                    <td className="py-2 font-mono text-xs">{ordem.numero}</td>
                    <td className="py-2 font-mono">{ordem.placa}</td>
                    <td className="py-2">{[ordem.veiculoMarca, ordem.veiculoModelo].filter(Boolean).join(' ') || '—'}</td>
                    <td className="py-2">{ordem.clienteNome}</td>
                    <td className="py-2">{new Date(ordem.dataEntrada).toLocaleDateString('pt-BR')}</td>
                    <td className="py-2">R$ {ordem.valorTotal.toFixed(2).replace('.', ',')}</td>
                    <td className="py-2">
                      <Select value={ordem.status} onValueChange={(v) => handleStatusChange(ordem.id, v)}>
                        <SelectTrigger className="h-8 w-[170px]">
                          <Badge variant={statusVariant[ordem.status]}>{statusLabels[ordem.status]}</Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-2 flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/admin/ordens-servico/${ordem.id}/editar`)}>
                        <Edit className="h-4 w-4 mr-1" /> Editar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setOrdemParaExcluir(ordem.id)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Excluir
                      </Button>
                    </td>
                  </tr>
                ))}
                {ordensFiltradas.length === 0 && (
                  <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">Nenhuma ordem de serviço encontrada.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!ordemParaExcluir} onOpenChange={() => setOrdemParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita. A ordem de serviço será permanentemente excluída.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleExcluir}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
