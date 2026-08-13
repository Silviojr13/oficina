'use client';

import { AdminHeader } from '@/components/admin-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useFuncionarioStore } from '@/lib/admin-store';
import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

const contratoLabels: Record<string, string> = {
  clt: 'CLT',
  pj: 'PJ',
  estagio: 'Estágio',
  temporario: 'Temporário',
};

const statusLabels: Record<string, string> = {
  ativo: 'Ativo',
  ferias: 'Férias',
  afastado: 'Afastado',
  inativo: 'Inativo',
};

const statusColors: Record<string, string> = {
  ativo: 'default',
  ferias: 'secondary',
  afastado: 'destructive',
  inativo: 'outline',
};

export default function EmployeesPage() {
  const { funcionarios, deleteFuncionario } = useFuncionarioStore();
  const [open, setOpen] = useState(false);

  // Calculate KPIs
  const totalAtivos = funcionarios.filter(f => f.status === 'ativo').length;
  const totalFolha = funcionarios
    .filter(f => f.status === 'ativo')
    .reduce((sum, f) => sum + f.salario, 0);
  const totalFeriasAfastados = funcionarios.filter(f => f.status === 'ferias' || f.status === 'afastado').length;

  return (
    <div className="space-y-6">
      <AdminHeader title="Funcionários" subtitle="Gestão de colaboradores" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAtivos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Folha Salarial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalFolha.toFixed(2).replace('.', ',')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Férias/Afastados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFeriasAfastados}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Novo Funcionário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Funcionário</DialogTitle>
            </DialogHeader>
            <p>Formulário de cadastro de funcionário irá aqui...</p>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Funcionários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left">Nome</th>
                  <th className="py-2 text-left">Cargo</th>
                  <th className="py-2 text-left">Setor</th>
                  <th className="py-2 text-left">Telefone</th>
                  <th className="py-2 text-left">Email</th>
                  <th className="py-2 text-left">Tipo Contrato</th>
                  <th className="py-2 text-left">Status</th>
                  <th className="py-2 text-left">Salário</th>
                  <th className="py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {funcionarios.map((funcionario) => (
                  <tr key={funcionario.id} className="border-b">
                    <td className="py-2">{funcionario.nome}</td>
                    <td className="py-2">{funcionario.cargo}</td>
                    <td className="py-2">{funcionario.setor}</td>
                    <td className="py-2">{funcionario.telefone}</td>
                    <td className="py-2">{funcionario.email}</td>
                    <td className="py-2">
                      <Badge variant="outline">{contratoLabels[funcionario.tipoContrato]}</Badge>
                    </td>
                    <td className="py-2">
                      <Badge variant={statusColors[funcionario.status]}>
                        {statusLabels[funcionario.status]}
                      </Badge>
                    </td>
                    <td className="py-2">R$ {funcionario.salario.toFixed(2).replace('.', ',')}</td>
                    <td className="py-2 flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" /> Editar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteFuncionario(funcionario.id)}>
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