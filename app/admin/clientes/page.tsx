'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { AdminHeader } from '@/components/admin-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus, Edit, Trash2, Car, Phone, Mail, User } from 'lucide-react';
import { toast } from 'sonner';
import {
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente,
  createVeiculo,
  deleteVeiculo,
} from '@/lib/actions/clientes';

type Veiculo = {
  id: string;
  placa: string;
  marca: string | null;
  modelo: string | null;
  ano: number | null;
  cor: string | null;
};

type Cliente = {
  id: string;
  nome: string;
  telefone: string | null;
  cpfCnpj: string | null;
  email: string | null;
  veiculos: Veiculo[];
};

export default function ClientesPage() {
  const isAdmin = useSession().data?.user?.role === 'admin';

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [veiculosNovoCliente, setVeiculosNovoCliente] = useState<{ placa: string; marca: string; modelo: string; ano: string; cor: string }[]>([]);

  const carregar = async () => {
    const resultado = await getClientes(1, 200);
    setClientes(resultado.data as Cliente[]);
  };

  useEffect(() => {
    carregar();
  }, []);

  const handleOpenNovo = () => {
    setEditando(null);
    setVeiculosNovoCliente([]);
    setOpen(true);
  };

  const handleOpenEdit = (cliente: Cliente) => {
    setEditando(cliente);
    setVeiculosNovoCliente([]);
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dados = {
      nome: String(formData.get('nome') ?? ''),
      telefone: String(formData.get('telefone') ?? ''),
      cpfCnpj: String(formData.get('cpfCnpj') ?? ''),
      email: String(formData.get('email') ?? ''),
    };

    const resultado = editando
      ? await updateCliente(editando.id, dados)
      : await createCliente({
          ...dados,
          veiculos: veiculosNovoCliente
            .filter((v) => v.placa.trim())
            .map((v) => ({
              placa: v.placa.toUpperCase(),
              marca: v.marca || undefined,
              modelo: v.modelo || undefined,
              ano: v.ano ? Number(v.ano) : undefined,
              cor: v.cor || undefined,
            })),
        });

    if (!resultado.success) {
      toast.error(`Erro ao salvar cliente: ${resultado.error}`);
      return;
    }

    toast.success(editando ? 'Cliente atualizado!' : 'Cliente cadastrado!');
    setOpen(false);
    await carregar();
  };

  const handleDeleteCliente = async (id: string) => {
    const resultado = await deleteCliente(id);
    if (!resultado.success) {
      toast.error(`Erro ao excluir cliente: ${resultado.error}`);
      return;
    }
    await carregar();
  };

  const handleAddVeiculoExistente = async (clienteId: string, placa: string) => {
    if (!placa.trim()) return;
    const resultado = await createVeiculo(clienteId, { placa: placa.toUpperCase() });
    if (!resultado.success) {
      toast.error(`Erro ao adicionar veículo: ${resultado.error}`);
      return;
    }
    await carregar();
  };

  const handleDeleteVeiculo = async (id: string) => {
    const resultado = await deleteVeiculo(id);
    if (!resultado.success) {
      toast.error(`Erro ao remover veículo: ${resultado.error}`);
      return;
    }
    await carregar();
  };

  const clientesFiltrados = clientes.filter((c) => {
    const termo = searchTerm.toLowerCase();
    return (
      c.nome.toLowerCase().includes(termo) ||
      (c.telefone ?? '').includes(termo) ||
      c.veiculos.some((v) => v.placa.toLowerCase().includes(termo))
    );
  });

  return (
    <>
      <AdminHeader title="Clientes" subtitle="Cadastro de clientes e veículos" />
      <main className="p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nome, telefone ou placa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenNovo}>
                <Plus className="mr-2 h-4 w-4" /> Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editando ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input id="nome" name="nome" defaultValue={editando?.nome} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" name="telefone" defaultValue={editando?.telefone ?? ''} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
                    <Input id="cpfCnpj" name="cpfCnpj" defaultValue={editando?.cpfCnpj ?? ''} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" name="email" type="email" defaultValue={editando?.email ?? ''} />
                </div>

                {!editando && (
                  <div className="space-y-2 border-t border-border pt-4">
                    <Label>Veículos (opcional, dá pra adicionar depois)</Label>
                    {veiculosNovoCliente.map((v, i) => (
                      <div key={i} className="grid grid-cols-[1fr_auto] gap-2">
                        <Input
                          placeholder="Placa"
                          value={v.placa}
                          onChange={(e) => {
                            const novos = [...veiculosNovoCliente];
                            novos[i] = { ...novos[i], placa: e.target.value };
                            setVeiculosNovoCliente(novos);
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setVeiculosNovoCliente(veiculosNovoCliente.filter((_, idx) => idx !== i))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setVeiculosNovoCliente([...veiculosNovoCliente, { placa: '', marca: '', modelo: '', ano: '', cor: '' }])}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" /> Adicionar Veículo
                    </Button>
                  </div>
                )}

                <Button type="submit" className="w-full">
                  {editando ? 'Salvar' : 'Cadastrar'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientesFiltrados.map((cliente) => (
            <Card key={cliente.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    {cliente.nome}
                  </CardTitle>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenEdit(cliente)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    {isAdmin && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteCliente(cliente.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1 text-sm text-muted-foreground">
                  {cliente.telefone && (
                    <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {cliente.telefone}</p>
                  )}
                  {cliente.email && (
                    <p className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {cliente.email}</p>
                  )}
                </div>

                <div className="space-y-1.5 border-t border-border pt-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Veículos</p>
                  {cliente.veiculos.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum veículo cadastrado.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {cliente.veiculos.map((v) => (
                        <Badge key={v.id} variant="outline" className="gap-1.5 pr-1">
                          <Car className="h-3 w-3" />
                          {v.placa}
                          {v.modelo && <span className="text-muted-foreground">· {v.modelo}</span>}
                          <button
                            type="button"
                            onClick={() => handleDeleteVeiculo(v.id)}
                            className="ml-1 hover:text-destructive"
                            aria-label={`Remover veículo ${v.placa}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <AdicionarVeiculoInline onAdd={(placa) => handleAddVeiculoExistente(cliente.id, placa)} />
                </div>
              </CardContent>
            </Card>
          ))}

          {clientesFiltrados.length === 0 && (
            <p className="text-center text-muted-foreground py-8 col-span-full">
              {clientes.length === 0 ? 'Nenhum cliente cadastrado ainda.' : 'Nenhum cliente encontrado com essa busca.'}
            </p>
          )}
        </div>
      </main>
    </>
  );
}

function AdicionarVeiculoInline({ onAdd }: { onAdd: (placa: string) => void }) {
  const [placa, setPlaca] = useState('');
  return (
    <form
      className="flex gap-1.5 pt-1"
      onSubmit={(e) => {
        e.preventDefault();
        onAdd(placa);
        setPlaca('');
      }}
    >
      <Input
        placeholder="Adicionar placa..."
        value={placa}
        onChange={(e) => setPlaca(e.target.value)}
        className="h-8 text-sm"
      />
      <Button type="submit" size="icon" variant="outline" className="h-8 w-8 flex-shrink-0">
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </form>
  );
}
