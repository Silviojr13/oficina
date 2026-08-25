'use client';

import { AdminHeader } from '@/components/admin-header';
import { Button } from '@/components/ui/button';
import { useProdutoStore } from '@/lib/admin-store';
import { Produto } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner'; // CORRECTION: Changed from 'react-hot-toast' to 'sonner'
import ProductForm from '@/components/admin/product-form';

export default function NewProductPage() {
  const router = useRouter();
  const { addProduto } = useProdutoStore();

  const handleSubmit = async (data: Partial<Produto>) => {
    const { id, createdAt, updatedAt, custoTotal, ...storeData } = data;
    // Explicitly cast storeData to the expected type for the store.
    // We rely on Zod validation to ensure required fields are present in `data`.
    await addProduto(storeData as Omit<Produto, 'id' | 'createdAt' | 'updatedAt' | 'custoTotal'>);
    router.push('/admin/produtos');
    toast.success('Produto criado com sucesso!');
  };

  return (
    <div className="space-y-6">
      <AdminHeader title="Novo Produto" subtitle="Adicione um novo produto ao catálogo" />
      <ProductForm
        onSubmit={handleSubmit}
        isEditing={false}
      />
    </div>
  );
}