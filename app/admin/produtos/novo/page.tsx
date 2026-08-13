'use client';

import { AdminHeader } from '@/components/admin-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProdutoStore } from '@/lib/admin-store';
import ProductForm from '@/components/admin/product-form'; // Assuming the component is created
import { Produto } from '@/lib/types';

export default function NewProductPage() {
  const { addProduto } = useProdutoStore();

  const handleSubmit = (data: Omit<Produto, 'id' | 'createdAt' | 'updatedAt' | 'custoTotal'>) => {
    addProduto(data);
    // Redirect logic can be added here if needed
  };

  return (
    <div className="space-y-6">
      <AdminHeader title="Novo Produto" subtitle="Cadastrar um novo item no catálogo" />
      <Card>
        <CardHeader>
          <CardTitle>Dados do Produto</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm onSubmit={handleSubmit} isEditing={false} />
        </CardContent>
      </Card>
    </div>
  );
}