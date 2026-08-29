'use client';

import { AdminHeader } from '@/components/admin-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useParams, useRouter } from 'next/navigation';
import { getProduto, updateProduto } from '@/lib/actions/produtos';
import { useEffect, useState } from 'react';
import { Produto } from '@/lib/types';
import { toast } from 'sonner';
import ProductForm from '@/components/admin/product-form';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [initialData, setInitialData] = useState<Partial<Produto> | null>(null);

  useEffect(() => {
    if (id) {
      getProduto(id).then((produto) => {
        if (produto) setInitialData(produto as unknown as Partial<Produto>);
      });
    }
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
    router.push('/admin/produtos');
  };

  return (
    <>
      <AdminHeader title="Editar Produto" subtitle={`ID: ${id}`} />
      <main className="p-4 sm:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados do Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductForm initialData={initialData} onSubmit={handleSubmit} isEditing={true} />
          </CardContent>
        </Card>
      </main>
    </>
  );
}