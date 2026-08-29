'use client';

import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin-header';
import { Produto } from '@/lib/types';
import { createProduto } from '@/lib/actions/produtos';
import { getFornecedores } from '@/lib/actions/fornecedores';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ProductForm from '@/components/admin/product-form';

export default function NewProductPage() {
  const router = useRouter();
  const [fornecedores, setFornecedores] = useState<any[]>([]);

  useEffect(() => {
    getFornecedores(1, 1000).then((res) => setFornecedores(res.data));
  }, []);

  const handleSubmit = async (data: Partial<Produto>) => {
    const { id, createdAt, updatedAt, custoTotal, ...produtoData } = data;
    const resultado = await createProduto(produtoData);

    if (!resultado.success) {
      toast.error(`Erro ao criar produto: ${resultado.error}`);
      return;
    }

    router.push('/admin/produtos');
    toast.success('Produto criado com sucesso! Enviando para o Mercado Livre em segundo plano...');
  };

  return (
    <>
      <AdminHeader title="Novo Produto" subtitle="Adicione um novo produto ao catálogo" />
      <main className="p-4 sm:p-6 space-y-6">
        <ProductForm
          onSubmit={handleSubmit}
          isEditing={false}
          fornecedores={fornecedores}
        />
      </main>
    </>
  );
}