'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AdminHeader } from '@/components/admin-header';
import OrdemServicoForm from '@/components/admin/ordem-servico-form';
import { createOrdemServico } from '@/lib/actions/ordens-servico';
import { getProdutos } from '@/lib/actions/produtos';
import type { Produto } from '@/lib/types';

export default function NovaOrdemServicoPage() {
  const router = useRouter();
  const [produtos, setProdutos] = useState<Produto[]>([]);

  useEffect(() => {
    getProdutos(1, 1000).then((res) => setProdutos(res.data as unknown as Produto[]));
  }, []);

  const handleSubmit = async (data: any) => {
    const resultado = await createOrdemServico(data);
    if (!resultado.success || !resultado.data) {
      toast.error(`Erro ao abrir ordem de serviço: ${resultado.error}`);
      return;
    }
    toast.success(`Ordem de serviço ${resultado.data.numero} aberta com sucesso!`);
    router.push('/admin/ordens-servico');
  };

  return (
    <div className="space-y-6">
      <AdminHeader title="Nova Ordem de Serviço" subtitle="Registrar entrada de veículo para serviço" />
      <OrdemServicoForm produtos={produtos} onSubmit={handleSubmit} isEditing={false} />
    </div>
  );
}
