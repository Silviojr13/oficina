'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  AlertTriangle, Tag, DollarSign, Boxes, Globe, Car, FileText, Plus, Trash2, Settings2, Info,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Produto, VeiculoCompativel } from '@/lib/types';
import { categorias, marcas, montadoras } from '@/lib/constants';
import { optionalNumber, nullsToUndefined, avisarErroValidacao } from '@/lib/zod-helpers';
import { BotaoLeitor } from '@/components/admin/leitor-codigo-barras';
import { buscarProdutoPorCodigo } from '@/lib/actions/produtos';
import { getConfigEstoque, type ConfigEstoque } from '@/lib/actions/configuracoes';
import { cn } from '@/lib/utils';

// Campos numericos opcionais usam optionalNumber(): um <input type="number">
// vazio vira NaN via valueAsNumber, e z.number().optional() sozinho rejeita NaN.
const produtoSchema = z.object({
  nome: z.string().min(1, 'Informe o nome do produto'),
  // SKU e slug sao gerados pelo sistema ao salvar (ver createProduto).
  slug: z.string().optional(),
  sku: z.string().optional(),
  codigoOEM: z.string().optional(),
  codigoBarras: z.string().optional(),
  ncm: z.string().regex(/^(\d{8})?$/, 'O NCM tem 8 números').optional(),
  cest: z.string().optional(),
  referenciaCruzada: z.array(z.string()).optional(),
  marca: z.string().min(1, 'Informe a marca'),
  fabricanteOriginal: z.string().optional(),
  paisOrigem: z.string().optional(),
  tipoAplicacao: z.enum(['universal', 'especifico']).default('especifico'),
  veiculosCompativeis: z.array(z.object({
    id: z.string(),
    montadora: z.string().min(1, 'Escolha a montadora'),
    modelo: z.string().min(1, 'Informe o modelo'),
    versaoMotor: z.string(),
    anoInicial: z.number().int().gte(1900, 'Ano inválido').lte(new Date().getFullYear() + 1, 'Ano inválido'),
    anoFinal: z.number().int().gte(1900, 'Ano inválido').lte(new Date().getFullYear() + 1, 'Ano inválido').nullable(),
    posicao: z.string(),
    observacao: z.string(),
  })).optional(),
  tipoPeca: z.enum(['original', 'paralela', 'remanufaturada', 'revisada']).default('paralela'),
  categoria: z.string().min(1, 'Escolha a categoria'),
  subcategoria: z.string().optional(),
  tags: z.array(z.string()).optional(),
  localizacaoEstoque: z.string().optional(),
  setorAlmoxarifado: z.string().optional(),
  pesoBruto: optionalNumber(z.number().nonnegative().optional()),
  pesoLiquido: optionalNumber(z.number().nonnegative().optional()),
  comprimento: optionalNumber(z.number().nonnegative().optional()),
  largura: optionalNumber(z.number().nonnegative().optional()),
  altura: optionalNumber(z.number().nonnegative().optional()),
  unidadeMedida: z.string().optional(),
  conteudoEmbalagem: optionalNumber(z.number().int().positive().optional()),
  material: z.string().optional(),
  cor: z.string().optional(),
  garantia: z.string().optional(),
  fichaTecnicaUrl: z.string().optional().or(z.literal('')),
  manualUrl: z.string().optional().or(z.literal('')),
  custoAquisicao: optionalNumber(z.number().nonnegative('O custo não pode ser negativo').optional()),
  freteEntrada: optionalNumber(z.number().nonnegative().optional()),
  impostosEntrada: optionalNumber(z.number().nonnegative().optional()),
  margemLucro: optionalNumber(z.number().optional()),
  precoVendaSugerido: optionalNumber(z.number().nonnegative().optional()),
  precoVendaBalcao: optionalNumber(z.number().positive('Informe o preço de venda').optional()),
  precoB2B: optionalNumber(z.number().nonnegative().optional()),
  precoMinimo: optionalNumber(z.number().nonnegative().optional()),
  descontoMaximo: optionalNumber(z.number().nonnegative().optional()),
  precoSite: optionalNumber(z.number().nonnegative().optional()),
  precoPromocional: optionalNumber(z.number().positive('O preço promocional deve ser maior que zero').nullable().optional()),
  dataInicioPromocao: z.string().optional(),
  dataFimPromocao: z.string().optional(),
  exibirNoSite: z.boolean().optional(),
  destaqueHome: z.boolean().optional(),
  aliquotaICMS: optionalNumber(z.number().nonnegative().optional()),
  aliquotaIPI: optionalNumber(z.number().nonnegative().optional()),
  cstCsosn: z.string().optional(),
  pisCofins: optionalNumber(z.number().nonnegative().optional()),
  regimeTributacao: z.string().optional(),
  estoqueAtual: optionalNumber(z.number().int().nonnegative('A quantidade não pode ser negativa').optional()),
  estoqueMinimo: optionalNumber(z.number().int().nonnegative().optional()),
  estoqueMaximo: optionalNumber(z.number().int().nonnegative().optional()),
  estoqueSeguranca: optionalNumber(z.number().int().nonnegative().optional()),
  controlaEstoque: z.boolean().optional(),
  permiteVendaSemEstoque: z.boolean().optional(),
  fornecedorPadraoId: z.string().optional(),
  prazoReposicao: optionalNumber(z.number().positive().optional()),
  fotos: z.array(z.string()).optional(),
  // Aceita URL absoluta e caminho relativo (/produtos/x.jpg).
  imagemPrincipal: z.string().optional().or(z.literal('')),
  descricaoCurta: z.string().optional(),
  descricaoCompleta: z.string().optional(),
  caracteristicas: z.array(z.string()).optional(),
  videoUrl: z.string().optional().or(z.literal('')),
});

type ProdutoFormData = z.infer<typeof produtoSchema>;

interface ProductFormProps {
  initialData?: Partial<Produto>;
  onSubmit: (data: Partial<Produto>) => void;
  isEditing: boolean;
  fornecedores?: { id: string; nomeFantasia: string }[];
}

const TIPOS_PECA = [
  { valor: 'paralela', rotulo: 'Paralela' },
  { valor: 'original', rotulo: 'Original' },
  { valor: 'remanufaturada', rotulo: 'Remanufaturada' },
  { valor: 'revisada', rotulo: 'Revisada' },
] as const;

const UNIDADES = [
  { valor: 'UN', rotulo: 'Unidade (UN)' },
  { valor: 'PC', rotulo: 'Peça (PC)' },
  { valor: 'JG', rotulo: 'Jogo (JG)' },
  { valor: 'KIT', rotulo: 'Kit' },
  { valor: 'PAR', rotulo: 'Par' },
  { valor: 'CX', rotulo: 'Caixa (CX)' },
  { valor: 'L', rotulo: 'Litro (L)' },
  { valor: 'M', rotulo: 'Metro (M)' },
];

const SECOES: { id: string; rotulo: string }[] = [
  { id: 'identificacao', rotulo: 'Identificação' },
  { id: 'preco', rotulo: 'Preço' },
  { id: 'estoque', rotulo: 'Estoque e local' },
  { id: 'loja', rotulo: 'Loja online' },
  { id: 'compatibilidade', rotulo: 'Veículos' },
  { id: 'fiscal', rotulo: 'Fiscal' },
];

const arredondar = (valor: number, casas = 2) => Math.round(valor * 10 ** casas) / 10 ** casas;
const formatarNcm = (ncm: string) => (ncm.length === 8 ? `${ncm.slice(0, 4)}.${ncm.slice(4, 6)}.${ncm.slice(6)}` : ncm);
const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function ProductForm({ initialData, onSubmit, isEditing, fornecedores = [] }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProdutoFormData>({
    resolver: zodResolver(produtoSchema),
    defaultValues: {
      // Colunas vazias vem do banco como null, e .optional() so aceita undefined.
      ...nullsToUndefined(initialData),
      tipoPeca: (initialData?.tipoPeca as ProdutoFormData['tipoPeca']) ?? 'paralela',
      tipoAplicacao: (initialData?.tipoAplicacao as ProdutoFormData['tipoAplicacao']) ?? 'especifico',
      unidadeMedida: initialData?.unidadeMedida ?? 'UN',
      exibirNoSite: initialData?.exibirNoSite ?? false,
      destaqueHome: initialData?.destaqueHome ?? false,
      controlaEstoque: initialData?.controlaEstoque ?? true,
      permiteVendaSemEstoque: initialData?.permiteVendaSemEstoque ?? false,
      veiculosCompativeis: initialData?.veiculosCompativeis ?? [],
      // O Prisma devolve Date; o campo do formulario e "YYYY-MM-DD".
      dataInicioPromocao: initialData?.dataInicioPromocao ? new Date(initialData.dataInicioPromocao).toISOString().slice(0, 10) : undefined,
      dataFimPromocao: initialData?.dataFimPromocao ? new Date(initialData.dataFimPromocao).toISOString().slice(0, 10) : undefined,
      precoPromocional: initialData?.precoPromocional ?? null,
    },
  });

  // ---------------- Margens (Configuracoes do estoque) ----------------
  const [config, setConfig] = useState<ConfigEstoque | null>(null);
  useEffect(() => {
    getConfigEstoque().then((c) => {
      setConfig(c);
      // Produto novo ja vem com a margem padrao marcada.
      if (!isEditing && initialData?.margemLucro == null) setValue('margemLucro', c.margemPadrao);
    });
  }, [isEditing, initialData?.margemLucro, setValue]);

  const custo = watch('custoAquisicao');
  const margem = watch('margemLucro');
  const precoBalcao = watch('precoVendaBalcao');
  const temCusto = typeof custo === 'number' && custo > 0;

  // Custo + margem calculam o preco; mexer no preco recalcula a margem.
  const aplicarMargem = (novaMargem: number) => {
    setValue('margemLucro', novaMargem, { shouldDirty: true });
    if (temCusto) setValue('precoVendaBalcao', arredondar(custo * (1 + novaMargem / 100)), { shouldDirty: true, shouldValidate: true });
  };
  const aoMudarCusto = (novoCusto: number) => {
    if (Number.isFinite(novoCusto) && novoCusto > 0 && typeof margem === 'number' && Number.isFinite(margem)) {
      setValue('precoVendaBalcao', arredondar(novoCusto * (1 + margem / 100)), { shouldDirty: true });
    }
  };
  const aoMudarPreco = (novoPreco: number) => {
    if (temCusto && Number.isFinite(novoPreco) && novoPreco > 0) {
      setValue('margemLucro', arredondar((novoPreco / custo - 1) * 100, 1), { shouldDirty: true });
    }
  };
  const lucroPorUnidade = temCusto && typeof precoBalcao === 'number' && precoBalcao > 0 ? precoBalcao - custo : null;

  // ---------------- Codigo de barras ----------------
  const [produtoComMesmoCodigo, setProdutoComMesmoCodigo] = useState<{ id: string; nome: string } | null>(null);
  const verificarCodigoBarras = async (codigo: string) => {
    if (!codigo.trim()) {
      setProdutoComMesmoCodigo(null);
      return;
    }
    const existente = await buscarProdutoPorCodigo(codigo);
    setProdutoComMesmoCodigo(existente && existente.id !== initialData?.id ? { id: existente.id, nome: existente.nome } : null);
  };
  const lerCodigoBarras = async (codigo: string) => {
    setValue('codigoBarras', codigo, { shouldDirty: true });
    await verificarCodigoBarras(codigo);
  };

  // ---------------- Veiculos compativeis ----------------
  const [veiculos, setVeiculos] = useState<VeiculoCompativel[]>(initialData?.veiculosCompativeis ?? []);
  const atualizarVeiculos = (novos: VeiculoCompativel[]) => {
    setVeiculos(novos);
    setValue('veiculosCompativeis', novos);
  };
  const adicionarVeiculo = () =>
    atualizarVeiculos([
      ...veiculos,
      { id: Date.now().toString(), montadora: '', modelo: '', versaoMotor: '', anoInicial: new Date().getFullYear(), anoFinal: null, posicao: '', observacao: '' },
    ]);
  const mudarVeiculo = (index: number, campo: keyof VeiculoCompativel, valor: string | number | null) =>
    atualizarVeiculos(veiculos.map((v, i) => (i === index ? { ...v, [campo]: valor } : v)));

  const categoria = watch('categoria');
  const subcategorias = categorias.find((c) => c.nome === categoria)?.subcategorias ?? [];
  const exibirNoSite = watch('exibirNoSite');
  const universal = watch('tipoAplicacao') === 'universal';
  const ncm = watch('ncm') ?? '';

  const enviar = (data: ProdutoFormData) => {
    onSubmit({
      ...data,
      // Sem preco proprio no site, a loja usa o preco de balcao.
      precoSite: data.precoSite && data.precoSite > 0 ? data.precoSite : data.precoVendaBalcao,
      veiculosCompativeis: universal ? [] : data.veiculosCompativeis,
    } as Partial<Produto>);
  };

  return (
    <form onSubmit={handleSubmit(enviar, avisarErroValidacao)} className="space-y-4 pb-24">
      {/* Atalhos para as secoes - no celular a pagina e longa. */}
      <nav aria-label="Seções do cadastro" className="sticky top-16 z-20 -mx-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-b border-border bg-background/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6">
        <ul className="flex gap-2">
          {SECOES.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="block whitespace-nowrap rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground hover:border-primary/50 hover:text-foreground">
                {s.rotulo}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* ============ IDENTIFICACAO ============ */}
      <Secao id="identificacao" icone={Tag} titulo="Identificação" descricao="O que é a peça e como encontrá-la.">
        <Campo id="nome" rotulo="Nome do produto" obrigatorio erro={errors.nome?.message}>
          <Input id="nome" placeholder="Ex.: Filtro de óleo PSL 55" autoComplete="off" {...register('nome')} />
        </Campo>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="marca" rotulo="Marca" obrigatorio erro={errors.marca?.message} ajuda="Escolha da lista ou digite qualquer marca.">
            <Input id="marca" list="lista-marcas" placeholder="Ex.: Tecfil, Metal Leve, Fram..." autoComplete="off" {...register('marca')} />
            <datalist id="lista-marcas">
              {marcas.map((m) => <option key={m} value={m} />)}
            </datalist>
          </Campo>
          <Campo id="categoria" rotulo="Categoria" obrigatorio erro={errors.categoria?.message}>
            <Select
              value={categoria}
              onValueChange={(valor) => {
                setValue('categoria', valor, { shouldValidate: true });
                setValue('subcategoria', undefined);
              }}
            >
              <SelectTrigger id="categoria" className="w-full"><SelectValue placeholder="Escolha a categoria" /></SelectTrigger>
              <SelectContent>
                {categorias.map((c) => <SelectItem key={c.nome} value={c.nome}>{c.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </Campo>
        </div>

        {subcategorias.length > 0 && (
          <Campo id="subcategoria" rotulo="Tipo de peça dentro da categoria">
            <div className="flex flex-wrap gap-2">
              {subcategorias.map((sub) => (
                <Chip key={sub} ativo={watch('subcategoria') === sub} onClick={() => setValue('subcategoria', watch('subcategoria') === sub ? undefined : sub)}>
                  {sub}
                </Chip>
              ))}
            </div>
          </Campo>
        )}

        <Campo id="tipoPeca" rotulo="Procedência">
          <div className="flex flex-wrap gap-2">
            {TIPOS_PECA.map((t) => (
              <Chip key={t.valor} ativo={watch('tipoPeca') === t.valor} onClick={() => setValue('tipoPeca', t.valor)}>
                {t.rotulo}
              </Chip>
            ))}
          </div>
        </Campo>

        <Campo id="codigoBarras" rotulo="Código de barras (EAN)" ajuda="O número embaixo das barras da embalagem.">
          <div className="flex gap-2">
            <Input
              id="codigoBarras"
              className="font-mono"
              inputMode="numeric"
              placeholder="Ex.: 7891234567890"
              autoComplete="off"
              {...register('codigoBarras', { onBlur: (e) => verificarCodigoBarras(e.target.value) })}
            />
            <BotaoLeitor onLeitura={lerCodigoBarras} titulo="Ler código do produto" rotulo="Ler" />
          </div>
          {produtoComMesmoCodigo && (
            <p className="mt-1.5 flex items-start gap-1.5 text-sm text-warning">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>
                Este código já está no produto{' '}
                <Link href={`/admin/produtos/${produtoComMesmoCodigo.id}/editar`} className="font-medium underline">{produtoComMesmoCodigo.nome}</Link>.
              </span>
            </p>
          )}
        </Campo>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="codigoOEM" rotulo="Código do fabricante" ajuda="A referência da peça no catálogo da marca (ex.: PSL55).">
            <Input id="codigoOEM" className="font-mono" placeholder="Ex.: PSL55" autoComplete="off" {...register('codigoOEM')} />
          </Campo>
          <Campo
            id="ncm"
            rotulo="NCM"
            erro={errors.ncm?.message}
            ajuda={ncm.length === 8 ? `NCM ${formatarNcm(ncm)}` : 'Vem na nota fiscal do fornecedor. Ex.: filtro de óleo 8421.23.00.'}
          >
            <Input
              id="ncm"
              className="font-mono"
              inputMode="numeric"
              maxLength={8}
              placeholder="8 números, ex.: 84212300"
              autoComplete="off"
              {...register('ncm', {
                setValueAs: (v: string) => (v ?? '').replace(/\D/g, '').slice(0, 8),
              })}
            />
          </Campo>
        </div>

        {isEditing && initialData?.sku ? (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5" /> Código interno (SKU): <span className="font-mono text-foreground">{initialData.sku}</span>
          </p>
        ) : (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5" /> O código interno (SKU) é criado pelo sistema ao salvar, a partir da categoria (ex.: FIL-00012).
          </p>
        )}
      </Secao>

      {/* ============ PRECO ============ */}
      <Secao
        id="preco"
        icone={DollarSign}
        titulo="Preço"
        descricao="Informe o custo e escolha a margem: o preço de venda é calculado. Ou digite o preço e a margem se ajusta."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="custoAquisicao" rotulo="Custo (quanto você pagou)" erro={errors.custoAquisicao?.message}>
            <CampoDinheiro>
              <Input
                id="custoAquisicao"
                type="number"
                step="0.01"
                inputMode="decimal"
                placeholder="0,00"
                className="pl-9"
                {...register('custoAquisicao', { valueAsNumber: true, onChange: (e) => aoMudarCusto(parseFloat(e.target.value)) })}
              />
            </CampoDinheiro>
          </Campo>
          <Campo id="precoVendaBalcao" rotulo="Preço de venda (balcão e OS)" obrigatorio erro={errors.precoVendaBalcao?.message}>
            <CampoDinheiro>
              <Input
                id="precoVendaBalcao"
                type="number"
                step="0.01"
                inputMode="decimal"
                placeholder="0,00"
                className="pl-9 font-semibold"
                {...register('precoVendaBalcao', { valueAsNumber: true, onChange: (e) => aoMudarPreco(parseFloat(e.target.value)) })}
              />
            </CampoDinheiro>
          </Campo>
        </div>

        <Campo id="margemLucro" rotulo="Margem de lucro" ajuda={temCusto ? undefined : 'Preencha o custo para a margem calcular o preço.'}>
          <div className="flex flex-wrap items-center gap-2">
            {(config?.margensRapidas ?? []).map((m) => (
              <Chip key={m} ativo={margem === m} onClick={() => aplicarMargem(m)}>{m}%</Chip>
            ))}
            <div className="relative w-28">
              <Input
                id="margemLucro"
                type="number"
                step="0.1"
                inputMode="decimal"
                placeholder="Outra"
                className="pr-7"
                {...register('margemLucro', { valueAsNumber: true, onChange: (e) => {
                  const m = parseFloat(e.target.value);
                  if (temCusto && Number.isFinite(m)) setValue('precoVendaBalcao', arredondar(custo * (1 + m / 100)));
                } })}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
            </div>
            <Link href="/admin/estoque/configuracoes" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <Settings2 className="h-3.5 w-3.5" /> editar margens
            </Link>
          </div>
        </Campo>

        {lucroPorUnidade != null && (
          <p className={cn('rounded-md px-3 py-2 text-sm', lucroPorUnidade >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive')}>
            {lucroPorUnidade >= 0 ? 'Lucro' : 'Prejuízo'} de {brl(Math.abs(lucroPorUnidade))} por unidade
            {typeof margem === 'number' && Number.isFinite(margem) ? ` (${margem}% sobre o custo)` : ''}.
          </p>
        )}

        <Recolhivel titulo="Promoção" aberto={!!initialData?.precoPromocional}>
          <div className="grid gap-4 sm:grid-cols-3">
            <Campo id="precoPromocional" rotulo="Preço promocional" erro={errors.precoPromocional?.message}>
              <CampoDinheiro>
                <Input id="precoPromocional" type="number" step="0.01" inputMode="decimal" placeholder="0,00" className="pl-9" {...register('precoPromocional', { valueAsNumber: true })} />
              </CampoDinheiro>
            </Campo>
            <Campo id="dataInicioPromocao" rotulo="Começa em">
              <Input id="dataInicioPromocao" type="date" {...register('dataInicioPromocao')} />
            </Campo>
            <Campo id="dataFimPromocao" rotulo="Termina em">
              <Input id="dataFimPromocao" type="date" {...register('dataFimPromocao')} />
            </Campo>
          </div>
        </Recolhivel>
      </Secao>

      {/* ============ ESTOQUE E LOCAL ============ */}
      <Secao id="estoque" icone={Boxes} titulo="Estoque e local" descricao="Quantas você tem e onde a peça fica guardada.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Campo id="estoqueAtual" rotulo="Quantidade em estoque" erro={errors.estoqueAtual?.message}>
            <Input id="estoqueAtual" type="number" inputMode="numeric" placeholder="0" {...register('estoqueAtual', { valueAsNumber: true })} />
          </Campo>
          <Campo id="estoqueMinimo" rotulo="Estoque mínimo" ajuda="Abaixo disso aparece em “Estoque baixo”.">
            <Input id="estoqueMinimo" type="number" inputMode="numeric" placeholder="Ex.: 2" {...register('estoqueMinimo', { valueAsNumber: true })} />
          </Campo>
          <Campo id="unidadeMedida" rotulo="Vendido por">
            <Select value={watch('unidadeMedida') ?? 'UN'} onValueChange={(v) => setValue('unidadeMedida', v)}>
              <SelectTrigger id="unidadeMedida" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {UNIDADES.map((u) => <SelectItem key={u.valor} value={u.valor}>{u.rotulo}</SelectItem>)}
              </SelectContent>
            </Select>
          </Campo>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="setorAlmoxarifado" rotulo="Setor / corredor">
            <Input id="setorAlmoxarifado" placeholder="Ex.: Corredor B, Elétrica, Mezanino" autoComplete="off" {...register('setorAlmoxarifado')} />
          </Campo>
          <Campo id="localizacaoEstoque" rotulo="Prateleira / posição">
            <Input id="localizacaoEstoque" placeholder="Ex.: Prateleira 3 – Caixa 12" autoComplete="off" {...register('localizacaoEstoque')} />
          </Campo>
        </div>

        {fornecedores.length > 0 && (
          <Campo id="fornecedorPadraoId" rotulo="Fornecedor de costume">
            <Select value={watch('fornecedorPadraoId')} onValueChange={(v) => setValue('fornecedorPadraoId', v)}>
              <SelectTrigger id="fornecedorPadraoId" className="w-full"><SelectValue placeholder="Opcional" /></SelectTrigger>
              <SelectContent>
                {fornecedores.map((f) => <SelectItem key={f.id} value={f.id}>{f.nomeFantasia}</SelectItem>)}
              </SelectContent>
            </Select>
          </Campo>
        )}

        <Interruptor
          id="permiteVendaSemEstoque"
          rotulo="Vender mesmo sem estoque"
          ajuda="Para peça que você encomenda na hora."
          checked={!!watch('permiteVendaSemEstoque')}
          onChange={(v) => setValue('permiteVendaSemEstoque', v)}
        />
      </Secao>

      {/* ============ LOJA ONLINE ============ */}
      <Secao id="loja" icone={Globe} titulo="Loja online" descricao="Só aparece no site se você ligar abaixo.">
        <Interruptor
          id="exibirNoSite"
          rotulo="Mostrar este produto no site"
          checked={!!exibirNoSite}
          onChange={(v) => setValue('exibirNoSite', v)}
        />
        {exibirNoSite && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo id="precoSite" rotulo="Preço no site" ajuda="Deixe vazio para usar o preço de balcão.">
                <CampoDinheiro>
                  <Input
                    id="precoSite"
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    placeholder={typeof precoBalcao === 'number' && precoBalcao > 0 ? precoBalcao.toFixed(2).replace('.', ',') : '0,00'}
                    className="pl-9"
                    {...register('precoSite', { valueAsNumber: true })}
                  />
                </CampoDinheiro>
              </Campo>
              <Campo id="imagemPrincipal" rotulo="Link da foto">
                <Input id="imagemPrincipal" placeholder="https://..." autoComplete="off" {...register('imagemPrincipal')} />
              </Campo>
            </div>
            <Campo id="descricaoCurta" rotulo="Resumo">
              <Textarea id="descricaoCurta" rows={2} placeholder="Uma frase sobre a peça, que aparece na lista do site." {...register('descricaoCurta')} />
            </Campo>
            <Campo id="descricaoCompleta" rotulo="Descrição completa">
              <Textarea id="descricaoCompleta" rows={5} placeholder="Medidas, aplicação, diferenciais..." {...register('descricaoCompleta')} />
            </Campo>
            <Interruptor id="destaqueHome" rotulo="Destaque na página inicial" checked={!!watch('destaqueHome')} onChange={(v) => setValue('destaqueHome', v)} />
          </>
        )}
      </Secao>

      {/* ============ VEICULOS ============ */}
      <Secao id="compatibilidade" icone={Car} titulo="Veículos compatíveis" descricao="Em quais carros a peça serve.">
        <Interruptor
          id="tipoAplicacao"
          rotulo="Serve em qualquer veículo (universal)"
          checked={universal}
          onChange={(v) => setValue('tipoAplicacao', v ? 'universal' : 'especifico')}
        />
        {!universal && (
          <div className="space-y-3">
            {veiculos.map((v, index) => (
              <div key={v.id} className="space-y-3 rounded-lg border border-border p-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <Campo id={`montadora-${index}`} rotulo="Montadora">
                    <Select value={v.montadora} onValueChange={(valor) => mudarVeiculo(index, 'montadora', valor)}>
                      <SelectTrigger id={`montadora-${index}`} className="w-full"><SelectValue placeholder="Escolha" /></SelectTrigger>
                      <SelectContent>
                        {montadoras.map((m) => <SelectItem key={m.nome} value={m.nome}>{m.nome}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Campo>
                  <Campo id={`modelo-${index}`} rotulo="Modelo">
                    <Input
                      id={`modelo-${index}`}
                      list={`modelos-${index}`}
                      placeholder="Ex.: Gol"
                      value={v.modelo}
                      onChange={(e) => mudarVeiculo(index, 'modelo', e.target.value)}
                    />
                    <datalist id={`modelos-${index}`}>
                      {(montadoras.find((m) => m.nome === v.montadora)?.modelos ?? []).map((m) => <option key={m} value={m} />)}
                    </datalist>
                  </Campo>
                  <Campo id={`motor-${index}`} rotulo="Motor / versão">
                    <Input id={`motor-${index}`} placeholder="Ex.: 1.0 8V" value={v.versaoMotor} onChange={(e) => mudarVeiculo(index, 'versaoMotor', e.target.value)} />
                  </Campo>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Campo id={`anoIni-${index}`} rotulo="Ano de">
                    <Input id={`anoIni-${index}`} type="number" inputMode="numeric" value={v.anoInicial} onChange={(e) => mudarVeiculo(index, 'anoInicial', parseInt(e.target.value))} />
                  </Campo>
                  <Campo id={`anoFim-${index}`} rotulo="Até">
                    <Input id={`anoFim-${index}`} type="number" inputMode="numeric" placeholder="Atual" value={v.anoFinal ?? ''} onChange={(e) => mudarVeiculo(index, 'anoFinal', e.target.value ? parseInt(e.target.value) : null)} />
                  </Campo>
                  <Campo id={`posicao-${index}`} rotulo="Posição">
                    <Input id={`posicao-${index}`} placeholder="Ex.: Dianteira" value={v.posicao} onChange={(e) => mudarVeiculo(index, 'posicao', e.target.value)} />
                  </Campo>
                  <div className="flex items-end">
                    <Button type="button" variant="ghost" className="w-full text-destructive" onClick={() => atualizarVeiculos(veiculos.filter((_, i) => i !== index))}>
                      <Trash2 className="mr-1.5 h-4 w-4" /> Remover
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={adicionarVeiculo}>
              <Plus className="mr-1.5 h-4 w-4" /> Adicionar veículo
            </Button>
          </div>
        )}
      </Secao>

      {/* ============ FISCAL ============ */}
      <Secao id="fiscal" icone={FileText} titulo="Fiscal" descricao="Para a nota fiscal. Se não souber, deixe em branco.">
        <Recolhivel titulo="Impostos e códigos fiscais" aberto={!!(initialData?.cest || initialData?.aliquotaICMS || initialData?.cstCsosn)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo id="cest" rotulo="CEST">
              <Input id="cest" className="font-mono" inputMode="numeric" placeholder="7 números" {...register('cest')} />
            </Campo>
            <Campo id="cstCsosn" rotulo="CST / CSOSN">
              <Input id="cstCsosn" className="font-mono" placeholder="Ex.: 102" {...register('cstCsosn')} />
            </Campo>
            <Campo id="aliquotaICMS" rotulo="ICMS (%)">
              <Input id="aliquotaICMS" type="number" step="0.01" inputMode="decimal" placeholder="Ex.: 18" {...register('aliquotaICMS', { valueAsNumber: true })} />
            </Campo>
            <Campo id="aliquotaIPI" rotulo="IPI (%)">
              <Input id="aliquotaIPI" type="number" step="0.01" inputMode="decimal" placeholder="Ex.: 5" {...register('aliquotaIPI', { valueAsNumber: true })} />
            </Campo>
          </div>
        </Recolhivel>
      </Secao>

      {/* Salvar sempre visivel - no celular o botao no fim da pagina ficava longe. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-3 backdrop-blur lg:left-[var(--sidebar-largura,18rem)]">
        <div className="mx-auto flex max-w-5xl items-center justify-end gap-3">
          <span className="hidden text-xs text-muted-foreground sm:inline">Campos com * são obrigatórios.</span>
          <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Cadastrar produto'}
          </Button>
        </div>
      </div>
    </form>
  );
}

// ---------------- Pecas de layout ----------------

function Secao({ id, icone: Icone, titulo, descricao, children }: { id: string; icone: LucideIcon; titulo: string; descricao?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-32 rounded-xl border border-border bg-card p-4 sm:p-5">
      <header className="mb-4 flex items-start gap-3">
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icone className="h-4 w-4" />
        </span>
        <div>
          <h2 className="font-display text-lg font-bold uppercase leading-tight">{titulo}</h2>
          {descricao && <p className="text-sm text-muted-foreground">{descricao}</p>}
        </div>
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Campo({ id, rotulo, obrigatorio, ajuda, erro, children }: { id: string; rotulo: string; obrigatorio?: boolean; ajuda?: string; erro?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {rotulo}
        {obrigatorio && <span className="text-primary"> *</span>}
      </Label>
      {children}
      {erro ? <p className="text-xs text-destructive">{erro}</p> : ajuda ? <p className="text-xs text-muted-foreground">{ajuda}</p> : null}
    </div>
  );
}

function CampoDinheiro({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
      {children}
    </div>
  );
}

function Chip({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={cn(
        'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
        ativo ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:border-primary/50'
      )}
    >
      {children}
    </button>
  );
}

function Interruptor({ id, rotulo, ajuda, checked, onChange }: { id: string; rotulo: string; ajuda?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border px-3 py-2.5">
      <div>
        <Label htmlFor={id} className="cursor-pointer">{rotulo}</Label>
        {ajuda && <p className="text-xs text-muted-foreground">{ajuda}</p>}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function Recolhivel({ titulo, aberto, children }: { titulo: string; aberto?: boolean; children: React.ReactNode }) {
  return (
    <details open={aberto} className="group rounded-lg border border-dashed border-border">
      <summary className="cursor-pointer list-none px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <span className="mr-1.5 inline-block transition-transform group-open:rotate-90">›</span>
        {titulo}
      </summary>
      <div className="px-3 pb-3">{children}</div>
    </details>
  );
}
