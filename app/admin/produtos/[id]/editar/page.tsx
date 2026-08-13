'use client';

import { AdminHeader } from '@/components/admin-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useParams } from 'next/navigation';
import { useProdutoStore } from '@/lib/admin-store';
import { useEffect, useState } from 'react';
import { Produto } from '@/lib/types';
import ProductForm from '@/components/admin/product-form'; // Assuming the component is created

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const { produtos, updateProduto } = useProdutoStore();
  const [initialData, setInitialData] = useState<Partial<Produto> | null>(null);

  useEffect(() => {
    if (id) {
      const produto = produtos.find(p => p.id === id);
      if (produto) {
        setInitialData(produto);
      }
    }
  }, [id, produtos]);

  if (!initialData) {
    return <div>Carregando...</div>; // Or a loading spinner
  }

  const handleSubmit = (data: Partial<Produto>) => {
    if (id) {
      updateProduto(id, data);
      // Redirect logic can be added here if needed
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader title="Editar Produto" subtitle={`ID: ${id}`} />
      <Card>
        <CardHeader>
          <CardTitle>Dados do Produto</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm initialData={initialData} onSubmit={handleSubmit} isEditing={true} />
        </CardContent>
      </Card>
    </div>
  );
}