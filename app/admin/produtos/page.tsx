'use client';

import { AdminHeader } from '@/components/admin-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { getProdutos, deleteProduto } from '@/lib/actions/produtos';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductListPage() {
  const router = useRouter();
  const [produtos, setProdutos] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [produtoToDelete, setProdutoToDelete] = useState<string | null>(null);

  const carregarProdutos = async () => {
    const resultado = await getProdutos(1, 1000);
    setProdutos(resultado.data);
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  const handleDeleteConfirm = async () => {
    if (produtoToDelete) {
      const resultado = await deleteProduto(produtoToDelete);
      if (!resultado.success) {
        toast.error(`Erro ao excluir produto: ${resultado.error}`);
      } else {
        await carregarProdutos();
      }
      setProdutoToDelete(null);
    }
  };

  const categorias = [
    { id: 1, nome: 'Motor' },
    { id: 2, nome: 'Freios' },
    { id: 3, nome: 'Suspensão' },
    { id: 4, nome: 'Transmissão' },
    { id: 5, nome: 'Elétrica' },
    { id: 6, nome: 'Filtros' },
    { id: 7, nome: 'Correia e Corrente' },
    { id: 8, nome: 'Arrefecimento' },
    { id: 9, nome: 'Combustível' },
    { id: 10, nome: 'Escapamento' },
    { id: 11, nome: 'Carroceria' },
    { id: 12, nome: 'Acessórios' },
    { id: 13, nome: 'Embreagem' },
    { id: 14, nome: 'Direção' },
    { id: 15, nome: 'Iluminação' },
    { id: 16, nome: 'Lubrificantes' },
  ];

  const filteredProducts = produtos.filter(p => {
    const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = !selectedCategoria || p.categoria === selectedCategoria;
    return matchesSearch && matchesCategoria;
  });

  return (
    <>
      <AdminHeader title="Produtos" subtitle="Gerencie o catálogo de produtos" />
      <main className="p-4 sm:p-6 space-y-6">
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
            {categorias.map(c => (
              <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>
            ))}
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
            <table className="w-full min-w-[860px]">
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
                  <th className="py-2 text-left">Mercado Livre</th>
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
                    <td className="py-2">
                      {produto.mercadoLivreStatus === 'sincronizado' && <Badge variant="default">Publicado</Badge>}
                      {produto.mercadoLivreStatus === 'erro' && (
                        <Badge variant="destructive" title={produto.mercadoLivreErro ?? ''}>Erro</Badge>
                      )}
                      {!produto.mercadoLivreStatus && <Badge variant="outline">Não enviado</Badge>}
                    </td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" title="Editar" onClick={() => router.push(`/admin/produtos/${produto.id}/editar`)}>
                          <Edit className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Editar</span>
                        </Button>
                        <Button variant="outline" size="sm" title="Excluir" onClick={() => setProdutoToDelete(produto.id)}>
                          <Trash2 className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Excluir</span>
                        </Button>
                      </div>
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
      </main>
    </>
  );
}