'use client';

import { AdminHeader } from '@/components/admin-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useFornecedorStore } from '@/lib/admin-store';
import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import FornecedorForm from '@/components/admin/fornecedor-form';

export default function SuppliersPage() {
  const { fornecedores, deleteFornecedor } = useFornecedorStore();
  const [open, setOpen] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState<any>(null); // Using any for simplicity, ideally would be Fornecedor | null

  const handleOpenEdit = (fornecedor: any) => {
    setEditingFornecedor(fornecedor);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingFornecedor(null);
  };

  // Calculate KPIs
  const totalFornecedores = fornecedores.length;
  const fornecedoresAtivos = fornecedores.filter(f => f.avaliacao >= 4).length; // Assuming rating >= 4 is active/satisfactory
  const mediaAvaliacao = fornecedores.reduce((sum, f) => sum + f.avaliacao, 0) / totalFornecedores || 0;

  return (
    <div className="space-y-6">
      <AdminHeader title="Fornecedores" subtitle="Gestão de fornecedores" />

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
        <Dialog open={open} onOpenChange={setOpen}>
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
              onSubmit={() => handleCloseDialog()}
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
                <Badge variant={fornecedor.avaliacao >= 4 ? 'default' : 'secondary'}>
                  {fornecedor.avaliacao}/5
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
                <Button variant="destructive" size="sm" onClick={() => deleteFornecedor(fornecedor.id)}>
                  <Trash2 className="h-4 w-4 mr-2" /> Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}