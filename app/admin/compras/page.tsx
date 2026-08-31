'use client';

import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getEntradasEstoque, createEntradaEstoque, deleteEntradaEstoque } from '@/lib/actions/entradas-estoque';
import { getFornecedores } from '@/lib/actions/fornecedores';
import { getProdutos } from '@/lib/actions/produtos';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import EntradaEstoqueForm from '@/components/admin/entrada-estoque-form';
import type { Produto } from '@/lib/types';

export default function PurchasesPage() {
  const isAdmin = useSession().data?.user?.role === 'admin';
  const [entradas, setEntradas] = useState<any[]>([]);
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [open, setOpen] = useState(false);

  const carregar = async () => {
    const resultado = await getEntradasEstoque(1, 1000);
    setEntradas(resultado.data);
  };

  useEffect(() => {
    carregar();
    getFornecedores(1, 1000).then((res) => setFornecedores(res.data));
    getProdutos(1, 1000).then((res) => setProdutos(res.data as unknown as Produto[]));
  }, []);

  const handleSubmit = async (data: any) => {
    const resultado = await createEntradaEstoque(data);
    if (!resultado.success) {
      toast.error(`Erro ao registrar entrada: ${resultado.error}`);
      return;
    }
    toast.success('Entrada de estoque registrada com sucesso!');
    setOpen(false);
    await carregar();
  };

  const handleDelete = async (id: string) => {
    const resultado = await deleteEntradaEstoque(id);
    if (!resultado.success) {
      toast.error(`Erro ao excluir entrada: ${resultado.error}`);
      return;
    }
    await carregar();
  };

  // Calculate KPIs
  const totalEntradas = entradas.length;
  const valorTotalEntradas = entradas.reduce((sum, e) => sum + (e.valorTotal ?? 0), 0);

  return (
    <>
      <AdminHeader title="Compras & Estoque" subtitle="Gestão de entradas de produtos" />
      <main className="p-4 sm:p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Entradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEntradas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {valorTotalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-3">
        <h2 className="text-xl font-semibold">Histórico de Entradas</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nova Entrada
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Entrada de Estoque</DialogTitle>
            </DialogHeader>
            <EntradaEstoqueForm produtos={produtos} fornecedores={fornecedores} onSubmit={handleSubmit} isEditing={false} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {entradas.length === 0 ? (
          <p className="text-center text-muted-foreground">Nenhuma entrada registrada ainda.</p>
        ) : (
          entradas.map((entrada) => (
            <Card key={entrada.id} className="overflow-hidden">
              <CardHeader className="bg-muted pb-3">
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-lg">NF: {entrada.numeroNF}</CardTitle>
                    <p className="text-sm text-muted-foreground break-all">Chave: {entrada.chaveAcesso}</p>
                  </div>
                  <Badge variant="outline" className="flex-shrink-0">
                    R$ {(entrada.valorTotal ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <p><span className="font-medium">Data da Entrada:</span> {new Date(entrada.dataEntrada).toLocaleDateString('pt-BR')}</p>
                <p><span className="font-medium">Fornecedor:</span> {entrada.fornecedor?.nomeFantasia ?? entrada.fornecedorId}</p>
                {isAdmin && (
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(entrada.id)}>
                      <Trash2 className="h-4 w-4 mr-2" /> Excluir
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
      </main>
    </>
  );
}
