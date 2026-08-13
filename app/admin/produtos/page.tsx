'use client';

import { AdminHeader } from '@/components/admin-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useProdutoStore } from '@/lib/admin-store';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';

export default function ProductListPage() {
  const router = useRouter();
  const { produtos, deleteProduto } = useProdutoStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [produtoToDelete, setProdutoToDelete] = useState<string | null>(null);

  const handleDeleteConfirm = () => {
    if (produtoToDelete) {
      deleteProduto(produtoToDelete);
      setProdutoToDelete(null);
    }
  };

  const filteredProducts = produtos.filter(p => {
    const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = !selectedCategoria || p.categoria === selectedCategoria;
    return matchesSearch && matchesCategoria;
  });

  return (
    <div className="space-y-6">
      <AdminHeader title="Produtos" subtitle="Gerencie o catálogo de produtos" />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nome ou SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="motor">Motor</SelectItem>
            <SelectItem value="freios">Freios</SelectItem>
            <SelectItem value="suspensao">Suspensão</SelectItem>
            <SelectItem value="transmissao">Transmissão</SelectItem>
            <SelectItem value="eletrica">Elétrica</SelectItem>
            <SelectItem value="filtros">Filtros</SelectItem>
            <SelectItem value="correia">Correia e Corrente</SelectItem>
            <SelectItem value="arrefecimento">Arrefecimento</SelectItem>
            <SelectItem value="combustivel">Combustível</SelectItem>
            <SelectItem value="escapamento">Escapamento</SelectItem>
            <SelectItem value="carroceria">Carroceria</SelectItem>
            <SelectItem value="acessorios">Acessórios</SelectItem>
            <SelectItem value="embreagem">Embreagem</SelectItem>
            <SelectItem value="direcao">Direção</SelectItem>
            <SelectItem value="iluminacao">Iluminação</SelectItem>
            <SelectItem value="lubrificantes">Lubrificantes</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => router.push('/admin/produtos/novo')}>
          <Plus className="mr-2 h-4 w-4" /> Novo Produto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left">Imagem</th>
                  <th className="py-2 text-left">Nome</th>
                  <th className="py-2 text-left">SKU</th>
                  <th className="py-2 text-left">Marca</th>
                  <th className="py-2 text-left">Categoria</th>
                  <th className="py-2 text-left">Preço Site</th>
                  <th className="py-2 text-left">Estoque</th>
                  <th className="py-2 text-left">Status</th>
                  <th className="py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((produto) => (
                  <tr key={produto.id} className="border-b">
                    <td className="py-2">
                      <img src={produto.imagemPrincipal} alt={produto.nome} className="w-10 h-10 object-contain" />
                    </td>
                    <td className="py-2">{produto.nome}</td>
                    <td className="py-2 font-mono text-xs">{produto.sku}</td>
                    <td className="py-2">{produto.marca}</td>
                    <td className="py-2">{produto.categoria}</td>
                    <td className="py-2">R$ {produto.precoSite.toFixed(2).replace('.', ',')}</td>
                    <td className={`py-2 ${produto.estoqueAtual <= produto.estoqueMinimo ? 'text-destructive' : ''}`}>
                      {produto.estoqueAtual}
                    </td>
                    <td className="py-2">
                      {produto.exibirNoSite ? (
                        <Badge variant="default">Ativo</Badge>
                      ) : (
                        <Badge variant="secondary">Inativo</Badge>
                      )}
                    </td>
                    <td className="py-2 flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/admin/produtos/${produto.id}/editar`)}>
                        <Edit className="h-4 w-4 mr-1" /> Editar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setProdutoToDelete(produto.id)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Excluir
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!produtoToDelete} onOpenChange={() => setProdutoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O produto será permanentemente excluído.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}