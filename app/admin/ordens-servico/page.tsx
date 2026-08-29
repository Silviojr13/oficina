'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AdminHeader } from '@/components/admin-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, Plus, Edit, Trash2, Clock, Car, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getOrdensServico, deleteOrdemServico, atualizarStatusOrdemServico } from '@/lib/actions/ordens-servico';

const colunas = [
  { status: 'aberto', label: 'Aberta', dotClass: 'bg-status-aberto' },
  { status: 'em_andamento', label: 'Em andamento', dotClass: 'bg-status-andamento' },
  { status: 'aguardando_peca', label: 'Aguardando peça', dotClass: 'bg-status-aguardando' },
  { status: 'aguardando_aprovacao', label: 'Aguardando aprovação', dotClass: 'bg-status-aguardando' },
  { status: 'concluido', label: 'Concluída', dotClass: 'bg-status-concluido' },
  { status: 'entregue', label: 'Entregue', dotClass: 'bg-status-entregue' },
] as const;

const statusLabels: Record<string, string> = {
  aberto: 'Aberta',
  em_andamento: 'Em andamento',
  aguardando_peca: 'Aguardando peça',
  aguardando_aprovacao: 'Aguardando aprovação',
  concluido: 'Concluída',
  entregue: 'Entregue',
  cancelado: 'Cancelada',
};

function diasNoPatio(dataEntrada: string) {
  const dias = Math.floor((Date.now() - new Date(dataEntrada).getTime()) / (1000 * 60 * 60 * 24));
  return dias <= 0 ? 'hoje' : `${dias} dia${dias > 1 ? 's' : ''}`;
}

export default function OrdensServicoPage() {
  const router = useRouter();
  const [ordens, setOrdens] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [ordemParaExcluir, setOrdemParaExcluir] = useState<string | null>(null);

  const carregar = async () => {
    const resultado = await getOrdensServico(1, 1000, searchTerm || undefined);
    setOrdens(resultado.data);
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const ativas = ordens.filter((o) => !['entregue', 'cancelado'].includes(o.status));
  const aguardandoPeca = ordens.filter((o) => o.status === 'aguardando_peca').length;
  const valorEmAberto = ativas.reduce((sum, o) => sum + o.valorTotal, 0);

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
      <AdminHeader title="Ordens de Serviço" subtitle="Pátio da oficina em tempo real" />

      <main className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">No pátio agora</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{ativas.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Aguardando peça</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-status-aguardando">{aguardandoPeca}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Valor em OS ativas</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">R$ {valorEmAberto.toFixed(2).replace('.', ',')}</div></CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por placa, cliente ou número..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Button onClick={() => router.push('/admin/ordens-servico/nova')}>
            <Plus className="mr-2 h-4 w-4" /> Nova Ordem de Serviço
          </Button>
        </div>

        <div className="overflow-x-auto pb-2 snap-x snap-mandatory scroll-px-6">
          <div className="flex gap-4 min-w-max">
            {colunas.map((coluna) => {
              const ordensDaColuna = ordens.filter((o) => o.status === coluna.status);
              return (
                <div key={coluna.status} className="w-[85vw] max-w-[280px] flex-shrink-0 snap-start">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <span className={cn('h-2 w-2 rounded-full', coluna.dotClass)} />
                    <h3 className="text-sm font-semibold">{coluna.label}</h3>
                    <span className="ml-auto text-xs text-muted-foreground font-mono">{ordensDaColuna.length}</span>
                  </div>
                  <div className="space-y-3">
                    {ordensDaColuna.map((ordem) => (
                      <Card key={ordem.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-mono font-bold text-base">{ordem.placa}</span>
                            <span className="font-mono text-[11px] text-muted-foreground">{ordem.numero}</span>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Car className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="truncate">{[ordem.veiculoMarca, ordem.veiculoModelo].filter(Boolean).join(' ') || 'Veículo não informado'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <UserIcon className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="truncate">{ordem.clienteNome}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                              <span>No pátio há {diasNoPatio(ordem.dataEntrada)}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-border">
                            <span className="font-semibold">R$ {ordem.valorTotal.toFixed(2).replace('.', ',')}</span>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => router.push(`/admin/ordens-servico/${ordem.id}/editar`)}>
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setOrdemParaExcluir(ordem.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          <Select value={ordem.status} onValueChange={(v) => handleStatusChange(ordem.id, v)}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {Object.entries(statusLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </CardContent>
                      </Card>
                    ))}
                    {ordensDaColuna.length === 0 && (
                      <div className="rounded-lg border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
                        Nenhuma OS aqui
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

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
