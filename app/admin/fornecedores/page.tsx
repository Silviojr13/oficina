'use client';

import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getFornecedores, createFornecedor, updateFornecedor, deleteFornecedor } from '@/lib/actions/fornecedores';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import FornecedorForm from '@/components/admin/fornecedor-form';

export default function SuppliersPage() {
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState<any>(null);

  const carregar = async () => {
    const resultado = await getFornecedores(1, 1000);
    setFornecedores(resultado.data);
  };

  useEffect(() => {
    carregar();
  }, []);

  const handleOpenEdit = (fornecedor: any) => {
    setEditingFornecedor(fornecedor);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingFornecedor(null);
  };

  const handleSubmit = async (data: any) => {
    const resultado = editingFornecedor
      ? await updateFornecedor(editingFornecedor.id, data)
      : await createFornecedor(data);

    if (!resultado.success) {
      toast.error(`Erro ao salvar fornecedor: ${resultado.error}`);
      return;
    }

    toast.success(editingFornecedor ? 'Fornecedor atualizado com sucesso!' : 'Fornecedor criado com sucesso!');
    handleCloseDialog();
    await carregar();
  };

  const handleDelete = async (id: string) => {
    const resultado = await deleteFornecedor(id);
    if (!resultado.success) {
      toast.error(`Erro ao excluir fornecedor: ${resultado.error}`);
      return;
    }
    await carregar();
  };

  // Calculate KPIs
  const totalFornecedores = fornecedores.length;
  const fornecedoresAtivos = fornecedores.filter(f => (f.avaliacao ?? 0) >= 4).length;
  const mediaAvaliacao = totalFornecedores > 0
    ? fornecedores.reduce((sum, f) => sum + (f.avaliacao ?? 0), 0) / totalFornecedores
    : 0;

  return (
    <>
      <AdminHeader title="Fornecedores" subtitle="Gestão de fornecedores" />
      <main className="p-4 sm:p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Fornecedores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFornecedores}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fornecedores Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fornecedoresAtivos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mediaAvaliacao.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-3">
        <h2 className="text-xl font-semibold">Lista de Fornecedores</h2>
        <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleCloseDialog())}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingFornecedor(null)}>
              <Plus className="mr-2 h-4 w-4" /> Novo Fornecedor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingFornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}</DialogTitle>
            </DialogHeader>
            <FornecedorForm
              initialData={editingFornecedor}
              onSubmit={handleSubmit}
              isEditing={!!editingFornecedor}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fornecedores.map((fornecedor) => (
          <Card key={fornecedor.id} className="overflow-hidden">
            <CardHeader className="bg-muted pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{fornecedor.nomeFantasia}</CardTitle>
                  <p className="text-sm text-muted-foreground">{fornecedor.razaoSocial}</p>
                </div>
                <Badge variant={(fornecedor.avaliacao ?? 0) >= 4 ? 'default' : 'secondary'}>
                  {fornecedor.avaliacao ?? '—'}/5
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <p><span className="font-medium">CNPJ:</span> {fornecedor.cnpj}</p>
              <p><span className="font-medium">Contato:</span> {fornecedor.contato}</p>
              <p><span className="font-medium">Telefone:</span> {fornecedor.telefone}</p>
              <p><span className="font-medium">Email:</span> {fornecedor.email}</p>
              <p><span className="font-medium">Endereço:</span> {fornecedor.endereco.logradouro}, {fornecedor.endereco.numero}, {fornecedor.endereco.cidade} - {fornecedor.endereco.estado}</p>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => handleOpenEdit(fornecedor)}>
                  <Edit className="h-4 w-4 mr-2" /> Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(fornecedor.id)}>
                  <Trash2 className="h-4 w-4 mr-2" /> Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      </main>
    </>
  );
}
