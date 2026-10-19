'use client';

import { AdminHeader } from '@/components/admin-header';
import { useParams, useRouter } from 'next/navigation';
import { getProduto, updateProduto } from '@/lib/actions/produtos';
import { getFornecedores } from '@/lib/actions/fornecedores';
import { useEffect, useState } from 'react';
import { Produto } from '@/lib/types';
import { toast } from 'sonner';
import ProductForm from '@/components/admin/product-form';
import { ExcluirProduto } from '@/components/admin/excluir-produto';
import { PublicarMercadoLivre } from '@/components/admin/publicar-mercado-livre';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [initialData, setInitialData] = useState<Partial<Produto> | null>(null);
  const [fornecedores, setFornecedores] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      getProduto(id).then((produto) => {
        if (produto) setInitialData(produto as unknown as Partial<Produto>);
      });
    }
    getFornecedores(1, 1000).then((res) => setFornecedores(res.data));
  }, [id]);

  if (!initialData) {
    return (
      <>
        <AdminHeader title="Editar Produto" subtitle="Carregando..." />
        <main className="p-4 sm:p-6">Carregando...</main>
      </>
    );
  }

  const handleSubmit = async (data: Partial<Produto>) => {
    if (!id) return;
    const resultado = await updateProduto(id, data);
    if (!resultado.success) {
      toast.error(`Erro ao atualizar produto: ${resultado.error}`);
      return;
    }
    toast.success('Produto atualizado com sucesso!');
    router.push('/admin/estoque');
  };

  return (
    <>
      <AdminHeader title="Editar Produto" subtitle={initialData.nome ?? ''} />
      <main className="p-4 sm:p-6 space-y-6">
        <ProductForm initialData={initialData} onSubmit={handleSubmit} isEditing={true} fornecedores={fornecedores} />
        <PublicarMercadoLivre produto={{ ...(initialData as any), id }} />
        <ExcluirProduto id={id} nome={initialData.nome ?? 'Produto'} ativo={(initialData as { ativo?: boolean }).ativo !== false} />
      </main>
    </>
  );
}