'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AdminHeader } from '@/components/admin-header';
import OrdemServicoForm from '@/components/admin/ordem-servico-form';
import { getOrdemServico, updateOrdemServico } from '@/lib/actions/ordens-servico';
import { getProdutos } from '@/lib/actions/produtos';
import type { Produto } from '@/lib/types';

export default function EditarOrdemServicoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [ordem, setOrdem] = useState<any>(null);

  useEffect(() => {
    getProdutos(1, 1000).then((res) => setProdutos(res.data as unknown as Produto[]));
    if (id) getOrdemServico(id).then(setOrdem);
  }, [id]);

  if (!ordem) {
    return (
      <>
        <AdminHeader title="Editar Ordem de Serviço" subtitle="Carregando..." />
        <main className="p-4 sm:p-6">Carregando...</main>
      </>
    );
  }

  const handleSubmit = async (data: any) => {
    const resultado = await updateOrdemServico(id, data);
    if (!resultado.success) {
      toast.error(`Erro ao atualizar ordem de serviço: ${resultado.error}`);
      return;
    }
    toast.success('Ordem de serviço atualizada com sucesso!');
    router.push('/admin/ordens-servico');
  };

  return (
    <>
      <AdminHeader title={`Editar ${ordem.numero}`} subtitle={`Placa ${ordem.placa}`} />
      <main className="p-4 sm:p-6 space-y-6">
        <OrdemServicoForm produtos={produtos} initialData={ordem} onSubmit={handleSubmit} isEditing={true} />
      </main>
    </>
  );
}
