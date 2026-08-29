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
import { Produto, VeiculoCompativel } from '@/lib/types';
import { categorias, marcas, montadoras } from '@/lib/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react'; // Added useState

// Definição do esquema de validação com Zod
const produtoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório"),
  sku: z.string().min(1, "SKU é obrigatório"),
  codigoOEM: z.string().optional(),
  codigoBarras: z.string().optional(),
  ncm: z.string().optional(),
  cest: z.string().optional(),
  referenciaCruzada: z.array(z.string()).optional(),
  marca: z.string().min(1, "Marca é obrigatória"),
  fabricanteOriginal: z.string().optional(),
  paisOrigem: z.string().optional(),
  tipoAplicacao: z.enum(['universal', 'especifico']).default('especifico'),
  veiculosCompativeis: z.array(z.object({
    id: z.string(),
    montadora: z.string().min(1, "Montadora é obrigatória"),
    modelo: z.string().min(1, "Modelo é obrigatório"),
    versaoMotor: z.string(),
    anoInicial: z.number().int().gte(1900, "Ano inválido").lte(new Date().getFullYear() + 1, "Ano inválido"),
    anoFinal: z.number().int().gte(1900, "Ano inválido").lte(new Date().getFullYear() + 1, "Ano inválido").nullable(),
    posicao: z.string(),
    observacao: z.string(),
  })).optional(),
  tipoPeca: z.enum(['original', 'paralela', 'remanufaturada', 'revisada']).default('paralela'),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  subcategoria: z.string().optional(),
  tags: z.array(z.string()).optional(),
  localizacaoEstoque: z.string().optional(),
  setorAlmoxarifado: z.string().optional(),
  pesoBruto: z.number().nonnegative("Peso deve ser positivo").optional(),
  pesoLiquido: z.number().nonnegative("Peso deve ser positivo").optional(),
  comprimento: z.number().nonnegative("Dimensão deve ser positiva").optional(),
  largura: z.number().nonnegative("Dimensão deve ser positiva").optional(),
  altura: z.number().nonnegative("Dimensão deve ser positiva").optional(),
  unidadeMedida: z.string().optional(),
  conteudoEmbalagem: z.number().int().positive("Quantidade deve ser positiva").optional(),
  material: z.string().optional(),
  cor: z.string().optional(),
  garantia: z.string().optional(),
  fichaTecnicaUrl: z.string().url("URL inválida").optional().or(z.literal('')),
  manualUrl: z.string().url("URL inválida").optional().or(z.literal('')),
  custoAquisicao: z.number().positive("Custo deve ser positivo").optional(),
  freteEntrada: z.number().nonnegative("Frete deve ser positivo").optional(),
  impostosEntrada: z.number().nonnegative("Impostos devem ser positivos").optional(),
  margemLucro: z.number().nonnegative("Margem deve ser positiva").optional(),
  precoVendaSugerido: z.number().positive("Preço deve ser positivo").optional(),
  precoVendaBalcao: z.number().positive("Preço deve ser positivo").optional(),
  precoB2B: z.number().positive("Preço deve ser positivo").optional(),
  precoMinimo: z.number().nonnegative("Preço deve ser positivo").optional(),
  descontoMaximo: z.number().nonnegative("Desconto deve ser positivo").optional(),
  precoSite: z.number().positive("Preço no site deve ser positivo").optional(),
  precoPromocional: z.number().positive("Preço promocional deve ser positivo").nullable().optional(),
  dataInicioPromocao: z.string().optional(), // Can be date string
  dataFimPromocao: z.string().optional(), // Can be date string
  exibirNoSite: z.boolean().optional(),
  destaqueHome: z.boolean().optional(),
  aliquotaICMS: z.number().nonnegative("Alíquota deve ser positiva").optional(),
  aliquotaIPI: z.number().nonnegative("Alíquota deve ser positiva").optional(),
  cstCsosn: z.string().optional(),
  pisCofins: z.number().nonnegative("Valor deve ser positivo").optional(),
  regimeTributacao: z.string().optional(),
  estoqueAtual: z.number().int().nonnegative("Estoque deve ser zero ou positivo").optional(),
  estoqueMinimo: z.number().int().nonnegative("Estoque deve ser zero ou positivo").optional(),
  estoqueMaximo: z.number().int().nonnegative("Estoque deve ser zero ou positivo").optional(),
  estoqueSeguranca: z.number().int().nonnegative("Estoque deve ser zero ou positivo").optional(),
  controlaEstoque: z.boolean().optional(),
  permiteVendaSemEstoque: z.boolean().optional(),
  fornecedorPadraoId: z.string().optional(),
  prazoReposicao: z.number().positive("Prazo deve ser positivo").optional(),
  fotos: z.array(z.string()).optional(),
  imagemPrincipal: z.string().url("URL inválida").optional().or(z.literal('')),
  descricaoCurta: z.string().optional(),
  descricaoCompleta: z.string().optional(),
  caracteristicas: z.array(z.string()).optional(),
  videoUrl: z.string().url("URL inválida").optional().or(z.literal('')),
});

type ProdutoFormData = z.infer<typeof produtoSchema>;

// Definindo as props do componente
interface ProductFormProps {
  initialData?: Partial<Produto>;
  onSubmit: (data: Partial<Produto>) => void;
  isEditing: boolean;
  fornecedores?: { id: string; nomeFantasia: string }[];
}

export default function ProductForm({ initialData, onSubmit, isEditing, fornecedores = [] }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProdutoFormData>({
    resolver: zodResolver(produtoSchema),
    defaultValues: {
      ...initialData,
      // Ensure booleans are handled correctly if undefined
      exibirNoSite: initialData?.exibirNoSite ?? false,
      destaqueHome: initialData?.destaqueHome ?? false,
      controlaEstoque: initialData?.controlaEstoque ?? true,
      permiteVendaSemEstoque: initialData?.permiteVendaSemEstoque ?? false,
      veiculosCompativeis: initialData?.veiculosCompativeis ?? [],
      // Handle nullable dates
      dataInicioPromocao: initialData?.dataInicioPromocao || undefined,
      dataFimPromocao: initialData?.dataFimPromocao || undefined,
      precoPromocional: initialData?.precoPromocional ?? null,
    },
  });

  // Observar o nome para gerar o slug automaticamente
  const nome = watch('nome');
  useEffect(() => {
    if (!initialData?.slug && nome) {
      setValue('slug', slugify(nome));
    }
  }, [nome, setValue, initialData?.slug]);

  // Estado para a aba de compatibilidade
  const [veiculos, setVeiculos] = useState<VeiculoCompativel[]>(initialData?.veiculosCompativeis ?? []);

  const handleAddVeiculo = () => {
    const novoVeiculo: VeiculoCompativel = {
      id: Date.now().toString(),
      montadora: '',
      modelo: '',
      versaoMotor: '',
      anoInicial: new Date().getFullYear(),
      anoFinal: null,
      posicao: '',
      observacao: ''
    };
    setVeiculos([...veiculos, novoVeiculo]);
    setValue('veiculosCompativeis', [...veiculos, novoVeiculo]);
  };

  const handleRemoveVeiculo = (index: number) => {
    const novosVeiculos = veiculos.filter((_, i) => i !== index);
    setVeiculos(novosVeiculos);
    setValue('veiculosCompativeis', novosVeiculos);
  };

  const handleVeiculoChange = (index: number, field: keyof VeiculoCompativel, value: any) => {
    const novosVeiculos = [...veiculos];
    (novosVeiculos[index] as any)[field] = value;
    setVeiculos(novosVeiculos);
    setValue('veiculosCompativeis', novosVeiculos);
  };

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
    // Convertendo VeiculoCompativel para o tipo correto do Produto se necessário
    // e garantindo que campos opcionais sejam tratados corretamente antes de submeter
    const processedData: Partial<Produto> = {
      ...data,
      // Garantir que campos como veiculosCompativeis tenham o formato correto
      // Assumindo que o tipo inferido do zod para veiculosCompativeis já esteja correto
    };
    onSubmit(processedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-5">
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
              <div>
                <Label htmlFor="marca">Marca *</Label>
                <Select value={watch('marca')} onValueChange={(value) => setValue('marca', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a marca" />
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
                <Select 
                  value={watch('categoria')} 
                  onValueChange={(value) => setValue('categoria', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map(c => (
                      // Usando c.nome como key, já que é o valor sendo usado
                      <SelectItem key={c.nome} value={c.nome}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoria && (
                  <span className="text-destructive text-sm">
                    {errors.categoria.message}
                  </span>
                )}
              </div>
              <div>
                <Label htmlFor="descricaoCurta">Descrição Curta</Label>
                <Textarea id="descricaoCurta" {...register('descricaoCurta')} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compatibilidade" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Veículos Compatíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <Button type="button" onClick={handleAddVeiculo}>Adicionar Veículo</Button>
              <div className="mt-4 space-y-4">
                {veiculos.map((v, index) => (
                  <Card key={v.id}>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Montadora</Label>
                          <Select value={v.montadora} onValueChange={(value) => handleVeiculoChange(index, 'montadora', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {montadoras.map(m => (
                                <SelectItem key={m.nome} value={m.nome}>{m.nome}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Modelo</Label>
                          <Input value={v.modelo} onChange={(e) => handleVeiculoChange(index, 'modelo', e.target.value)} />
                        </div>
                        <div>
                          <Label>Versão/Motor</Label>
                          <Input value={v.versaoMotor} onChange={(e) => handleVeiculoChange(index, 'versaoMotor', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label>Ano Inicial</Label>
                            <Input
                              type="number"
                              value={v.anoInicial}
                              onChange={(e) => handleVeiculoChange(index, 'anoInicial', parseInt(e.target.value))}
                            />
                          </div>
                          <div>
                            <Label>Ano Final</Label>
                            <Input
                              type="number"
                              value={v.anoFinal ?? ''}
                              onChange={(e) => handleVeiculoChange(index, 'anoFinal', e.target.value ? parseInt(e.target.value) : null)}
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Posição</Label>
                          <Input value={v.posicao} onChange={(e) => handleVeiculoChange(index, 'posicao', e.target.value)} />
                        </div>
                        <div>
                          <Label>Observação</Label>
                          <Input value={v.observacao} onChange={(e) => handleVeiculoChange(index, 'observacao', e.target.value)} />
                        </div>
                      </div>
                      <Button type="button" variant="destructive" size="sm" className="mt-2" onClick={() => handleRemoveVeiculo(index)}>
                        Remover
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preco" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Preços e Fiscal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="custoAquisicao">Custo de Aquisição</Label>
                  <Input id="custoAquisicao" type="number" step="0.01" {...register('custoAquisicao', { valueAsNumber: true })} />
                </div>
                <div>
                  <Label htmlFor="margemLucro">Margem de Lucro (%)</Label>
                  <Input id="margemLucro" type="number" step="0.01" {...register('margemLucro', { valueAsNumber: true })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="precoSite">Preço no Site *</Label>
                  <Input id="precoSite" type="number" step="0.01" {...register('precoSite', { valueAsNumber: true })} />
                  {errors.precoSite && <span className="text-destructive text-sm">{errors.precoSite.message}</span>}
                </div>
                <div>
                  <Label htmlFor="precoPromocional">Preço Promocional</Label>
                  <Input id="precoPromocional" type="number" step="0.01" {...register('precoPromocional', { valueAsNumber: true })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="aliquotaICMS">Alíquota ICMS (%)</Label>
                  <Input id="aliquotaICMS" type="number" step="0.01" {...register('aliquotaICMS', { valueAsNumber: true })} />
                </div>
                <div>
                  <Label htmlFor="aliquotaIPI">Alíquota IPI (%)</Label>
                  <Input id="aliquotaIPI" type="number" step="0.01" {...register('aliquotaIPI', { valueAsNumber: true })} />
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
                  <Input id="estoqueAtual" type="number" {...register('estoqueAtual', { valueAsNumber: true })} />
                </div>
                <div>
                  <Label htmlFor="estoqueMinimo">Estoque Mínimo</Label>
                  <Input id="estoqueMinimo" type="number" {...register('estoqueMinimo', { valueAsNumber: true })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch id="controlaEstoque" checked={watch('controlaEstoque')} onCheckedChange={(checked) => setValue('controlaEstoque', checked)} />
                  <Label htmlFor="controlaEstoque">Controla Estoque?</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="permiteVendaSemEstoque" checked={watch('permiteVendaSemEstoque')} onCheckedChange={(checked) => setValue('permiteVendaSemEstoque', checked)} />
                  <Label htmlFor="permiteVendaSemEstoque">Permite Venda sem Estoque?</Label>
                </div>
              </div>
              <div>
                <Label htmlFor="fornecedorPadraoId">Fornecedor Padrão</Label>
                <Select value={watch('fornecedorPadraoId')} onValueChange={(value) => setValue('fornecedorPadraoId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {fornecedores.map(f => (
                      <SelectItem key={f.id} value={f.id}>{f.nomeFantasia}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="midia" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Mídia e Informações para o Site</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="imagemPrincipal">URL da Imagem Principal</Label>
                <Input id="imagemPrincipal" {...register('imagemPrincipal')} />
              </div>
              <div>
                <Label htmlFor="descricaoCompleta">Descrição Completa</Label>
                <Textarea id="descricaoCompleta" rows={6} {...register('descricaoCompleta')} />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="exibirNoSite" checked={watch('exibirNoSite')} onCheckedChange={(checked) => setValue('exibirNoSite', checked)} />
                <Label htmlFor="exibirNoSite">Exibir no Site?</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Button type="submit">{isEditing ? 'Atualizar Produto' : 'Criar Produto'}</Button>
    </form>
  );
}