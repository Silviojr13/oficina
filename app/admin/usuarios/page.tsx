'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { AdminHeader } from '@/components/admin-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import { toast } from 'sonner';
import { getUsuarios, updateUsuarioRole } from '@/lib/actions/usuarios';

type Usuario = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  createdAt: Date;
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  funcionario: 'Funcionário',
  cliente: 'Cliente',
};

export default function UsuariosPage() {
  const { data: session } = useSession();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = async () => {
    const dados = await getUsuarios();
    setUsuarios(dados);
    setCarregando(false);
  };

  useEffect(() => {
    carregar();
  }, []);

  const handleRoleChange = async (userId: string, role: string) => {
    const resultado = await updateUsuarioRole(userId, role);
    if (!resultado.success) {
      toast.error(`Erro ao atualizar papel: ${resultado.error}`);
      return;
    }
    toast.success('Papel do usuário atualizado.');
    await carregar();
  };

  return (
    <>
      <AdminHeader title="Usuários" subtitle="Quem já entrou no sistema e o papel de cada um" />
      <main className="p-4 sm:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Contas cadastradas</CardTitle>
          </CardHeader>
          <CardContent>
            {carregando ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Carregando...</p>
            ) : usuarios.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Ninguém entrou pelo Google ainda. A pessoa precisa fazer login uma vez em /login antes de aparecer aqui.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px]">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left">Usuário</th>
                      <th className="py-2 text-left">E-mail</th>
                      <th className="py-2 text-left">Papel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((usuario) => {
                      const isVoceMesmo = usuario.id === session?.user?.id;
                      return (
                        <tr key={usuario.id} className="border-b">
                          <td className="py-2">
                            <div className="flex items-center gap-2">
                              {usuario.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={usuario.image} alt="" className="h-8 w-8 rounded-full" />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                              <span>{usuario.name ?? '—'}</span>
                              {isVoceMesmo && <Badge variant="outline">Você</Badge>}
                            </div>
                          </td>
                          <td className="py-2 text-muted-foreground">{usuario.email}</td>
                          <td className="py-2">
                            <Select
                              value={usuario.role}
                              onValueChange={(role) => handleRoleChange(usuario.id, role)}
                              disabled={isVoceMesmo}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue>{ROLE_LABELS[usuario.role] ?? usuario.role}</SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cliente">Cliente</SelectItem>
                                <SelectItem value="funcionario">Funcionário</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
