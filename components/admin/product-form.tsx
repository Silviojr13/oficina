'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { Produto } from '@/lib/types';
import { categorias, marcas, montadoras, fornecedores } from '@/lib/mock-data';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react'; // Import added

// Definição do esquema de validação com Zod
const produtoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  sku: z.string().min(1, "SKU é obrigatório"),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  precoSite: z.number().positive("Preço no site deve ser positivo"),
});

type ProdutoFormData = z.infer<typeof produtoSchema>;

// Definindo as props do componente
interface ProductFormProps {
  initialData?: Partial<Produto>;
  onSubmit: (data: Partial<Produto>) => void;
  isEditing: boolean;
}

export default function ProductForm({ initialData, onSubmit, isEditing }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProdutoFormData>({
    resolver: zodResolver(produtoSchema),
    defaultValues: initialData,
  });

  // Observar o nome para gerar o slug automaticamente
  const nome = watch('nome');
  useEffect(() => {
    if (!initialData?.slug && nome) {
      setValue('slug', slugify(nome));
    }
  }, [nome, setValue, initialData?.slug]);

  // Função auxiliar para gerar slug
  const slugify = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Função chamada ao submeter o formulário
  const handleFormSubmit = (data: ProdutoFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="compatibilidade">Compatibilidade</TabsTrigger>
          <TabsTrigger value="preco">Preço & Fiscal</TabsTrigger>
          <TabsTrigger value="estoque">Estoque</TabsTrigger>
          <TabsTrigger value="midia">Mídia & Site</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input id="nome" {...register('nome', { required: true })} />
                  {errors.nome && <span className="text-destructive text-sm">{errors.nome.message}</span>}
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" {...register('slug')} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sku">SKU *</Label>
                  <Input id="sku" {...register('sku', { required: true })} />
                  {errors.sku && <span className="text-destructive text-sm">{errors.sku.message}</span>}
                </div>
                <div>
                  <Label htmlFor="codigoOEM">Código OEM</Label>
                  <Input id="codigoOEM" {...register('codigoOEM')} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="marca">Marca</Label>
                  <Select value={watch('marca')} onValueChange={(val) => setValue('marca', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma marca" />
                    </SelectTrigger>
                    <SelectContent>
                      {marcas.map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select value={watch('categoria')} onValueChange={(val) => setValue('categoria', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoria && <span className="text-destructive text-sm">{errors.categoria.message}</span>}
                </div>
              </div>
              <div>
                <Label htmlFor="descricaoCurta">Descrição Curta</Label>
                <Textarea id="descricaoCurta" {...register('descricaoCurta')} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compatibilidade" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Compatibilidade com Veículos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">A funcionalidade de gerenciamento de veículos compatíveis será implementada em breve.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preco" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Preços e Informações Fiscais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="precoSite">Preço no Site *</Label>
                  <Input
                    id="precoSite"
                    type="number"
                    step="0.01"
                    {...register('precoSite', { valueAsNumber: true, required: true })}
                  />
                  {errors.precoSite && <span className="text-destructive text-sm">{errors.precoSite.message}</span>}
                </div>
                <div>
                  <Label htmlFor="exibirNoSite">Exibir no Site</Label>
                  <Switch id="exibirNoSite" checked={watch('exibirNoSite')} onCheckedChange={(checked) => setValue('exibirNoSite', checked)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="custoAquisicao">Custo de Aquisição</Label>
                  <Input
                    id="custoAquisicao"
                    type="number"
                    step="0.01"
                    {...register('custoAquisicao', { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <Label htmlFor="margemLucro">Margem de Lucro (%)</Label>
                  <Input
                    id="margemLucro"
                    type="number"
                    step="0.01"
                    {...register('margemLucro', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estoque" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Controle de Estoque</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estoqueAtual">Estoque Atual</Label>
                  <Input
                    id="estoqueAtual"
                    type="number"
                    {...register('estoqueAtual', { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <Label htmlFor="estoqueMinimo">Estoque Mínimo</Label>
                  <Input
                    id="estoqueMinimo"
                    type="number"
                    {...register('estoqueMinimo', { valueAsNumber: true })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fornecedorPadraoId">Fornecedor Padrão</Label>
                  <Select value={watch('fornecedorPadraoId')} onValueChange={(val) => setValue('fornecedorPadraoId', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {fornecedores.map(f => (
                        <SelectItem key={f.id} value={f.id}>{f.nomeFantasia}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="controlaEstoque">Controla Estoque</Label>
                  <Switch id="controlaEstoque" checked={watch('controlaEstoque')} onCheckedChange={(checked) => setValue('controlaEstoque', checked)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="midia" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Mídias e Informações para o Site</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="imagemPrincipal">Imagem Principal</Label>
                <Input id="imagemPrincipal" type="file" />
              </div>
              <div>
                <Label htmlFor="descricaoCompleta">Descrição Completa</Label>
                <Textarea id="descricaoCompleta" {...register('descricaoCompleta')} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Button type="submit">{isEditing ? 'Atualizar Produto' : 'Criar Produto'}</Button>
    </form>
  );
}
