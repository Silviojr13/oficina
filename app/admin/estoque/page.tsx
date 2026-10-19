'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Search, Plus, Pencil, Trash2, X, PackageSearch, Package, Globe, Wrench, AlertTriangle, Archive, Settings2, type LucideIcon } from 'lucide-react';
import { AdminHeader } from '@/components/admin-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { BotaoLeitor } from '@/components/admin/leitor-codigo-barras';
import { getProdutos, deleteProduto, arquivarProduto, buscarProdutoPorCodigo } from '@/lib/actions/produtos';
import { categorias } from '@/lib/constants';
import { textoDeBusca, combinaBusca } from '@/lib/busca';
import { cn } from '@/lib/utils';

type ProdutoEstoque = {
  id: string;
  nome: string;
  sku: string;
  marca: string;
  categoria: string;
  codigoBarras: string | null;
  codigoOEM: string | null;
  imagemPrincipal: string | null;
  estoqueAtual: number;
  estoqueMinimo: number | null;
  localizacaoEstoque: string | null;
  precoVendaBalcao: number | null;
  precoSite: number | null;
  exibirNoSite: boolean;
  ativo: boolean;
  mercadoLivreStatus: string | null;
  mercadoLivreErro: string | null;
};

// "Loja online" = produtos marcados para aparecer no site; "So na oficina" =
// pecas usadas no balcao e nas OS que nao vao para o site.
type Aba = 'todos' | 'online' | 'oficina' | 'baixo';

const ABAS: { id: Aba; rotulo: string; descricao: string; icone: LucideIcon }[] = [
  { id: 'todos', rotulo: 'Todos', descricao: 'produtos cadastrados', icone: Package },
  { id: 'online', rotulo: 'Loja online', descricao: 'aparecem no site', icone: Globe },
  { id: 'oficina', rotulo: 'Só na oficina', descricao: 'balcão e OS', icone: Wrench },
  { id: 'baixo', rotulo: 'Estoque baixo', descricao: 'no mínimo ou zerados', icone: AlertTriangle },
];

function situacaoEstoque(p: ProdutoEstoque) {
  if (p.estoqueAtual <= 0) return 'sem';
  if (p.estoqueAtual <= (p.estoqueMinimo ?? 0)) return 'baixo';
  return 'ok';
}

function formatarPreco(valor: number | null | undefined) {
  return valor ? `R$ ${valor.toFixed(2).replace('.', ',')}` : '—';
}

export default function EstoquePage({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  const router = useRouter();
  const isAdmin = useSession().data?.user?.role === 'admin';
  const { aba: abaInicial } = use(searchParams);

  const [produtos, setProdutos] = useState<ProdutoEstoque[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [aba, setAba] = useState<Aba>(ABAS.some((a) => a.id === abaInicial) ? (abaInicial as Aba) : 'todos');
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('todas');
  const [paraExcluir, setParaExcluir] = useState<ProdutoEstoque | null>(null);
  // Arquivados ("saiu de linha") ficam fora das abas; aparecem so aqui.
  const [verArquivados, setVerArquivados] = useState(false);
  const [todos, setTodos] = useState<ProdutoEstoque[]>([]);

  const carregar = () =>
    getProdutos(1, 1000, undefined, true).then((res) => {
      const lista = res.data as unknown as ProdutoEstoque[];
      setTodos(lista);
      setProdutos(lista.filter((p) => p.ativo !== false));
      setCarregando(false);
    });

  useEffect(() => {
    carregar();
  }, []);

  const contagem = useMemo(
    () => ({
      todos: produtos.length,
      online: produtos.filter((p) => p.exibirNoSite).length,
      oficina: produtos.filter((p) => !p.exibirNoSite).length,
      baixo: produtos.filter((p) => situacaoEstoque(p) !== 'ok').length,
    }),
    [produtos]
  );

  const arquivados = useMemo(() => todos.filter((p) => p.ativo === false), [todos]);

  const indice = useMemo(
    () => (verArquivados ? arquivados : produtos).map((p) => ({ p, texto: textoDeBusca(p.nome, p.marca, p.categoria, p.sku, p.codigoBarras, p.codigoOEM) })),
    [produtos, arquivados, verArquivados]
  );

  const lista = useMemo(() => {
    const filtrados = indice
      .filter(({ p }) => {
        if (verArquivados) return categoria === 'todas' || p.categoria === categoria;
        if (aba === 'online' && !p.exibirNoSite) return false;
        if (aba === 'oficina' && p.exibirNoSite) return false;
        if (aba === 'baixo' && situacaoEstoque(p) === 'ok') return false;
        if (categoria !== 'todas' && p.categoria !== categoria) return false;
        return true;
      })
      .filter(({ texto }) => !busca.trim() || combinaBusca(texto, busca))
      .map(({ p }) => p);
    // Em "Estoque baixo" o que importa e o que acabou primeiro.
    return aba === 'baixo'
      ? filtrados.sort((a, b) => a.estoqueAtual - b.estoqueAtual)
      : filtrados.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }, [indice, aba, categoria, busca, verArquivados]);

  const escolherAba = (nova: Aba) => {
    setVerArquivados(false);
    setAba(nova);
    router.replace(nova === 'todos' ? '/admin/estoque' : `/admin/estoque?aba=${nova}`, { scroll: false });
  };

  const excluir = async () => {
    if (!paraExcluir) return;
    const alvo = paraExcluir;
    const resultado = await deleteProduto(alvo.id);
    if (!resultado.success && 'emUso' in resultado && resultado.emUso) {
      toast.error(`${alvo.nome} já tem vendas, compras ou OS e não pode ser excluído.`, {
        description: 'Arquive: ele sai do estoque e da loja, mas o histórico fica.',
        action: {
          label: 'Arquivar',
          onClick: async () => {
            const r = await arquivarProduto(alvo.id, true);
            if (r.success) {
              toast.success(`${alvo.nome} arquivado.`);
              await carregar();
            } else toast.error(`Não foi possível arquivar: ${r.error}`);
          },
        },
      });
    } else if (!resultado.success) toast.error(`Não foi possível excluir: ${resultado.error}`);
    else {
      toast.success('Produto excluído.');
      await carregar();
    }
    setParaExcluir(null);
  };

  const lerCodigo = async (codigo: string) => {
    const produto = await buscarProdutoPorCodigo(codigo);
    if (produto) {
      router.push(`/admin/produtos/${produto.id}/editar`);
      return;
    }
    toast.error(`Código ${codigo} não está cadastrado.`, {
      action: { label: 'Cadastrar', onClick: () => router.push(`/admin/produtos/novo?codigoBarras=${encodeURIComponent(codigo)}`) },
    });
  };

  return (
    <>
      <AdminHeader title="Estoque" subtitle="Peças da oficina e produtos da loja online" />
      <main className="space-y-5 p-4 sm:p-6">
        {/* Os resumos sao tambem as abas: tocar filtra a lista. */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" role="tablist" aria-label="Filtrar estoque">
          {ABAS.map(({ id, rotulo, descricao, icone: Icone }) => {
            const ativo = !verArquivados && aba === id;
            const alerta = id === 'baixo' && contagem.baixo > 0;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={ativo}
                onClick={() => escolherAba(id)}
                className={cn(
                  'flex flex-col items-start gap-1 rounded-xl border bg-card p-3 text-left transition-colors sm:p-4',
                  ativo ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-primary/40'
                )}
              >
                <span className={cn('flex items-center gap-1.5 text-xs font-medium', alerta ? 'text-warning' : 'text-muted-foreground')}>
                  <Icone className="h-3.5 w-3.5" /> {rotulo}
                </span>
                <span className="font-display text-2xl font-bold tabular-nums sm:text-3xl">{carregando ? '–' : contagem[id]}</span>
                <span className="text-xs text-muted-foreground">{descricao}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="buscaEstoque"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, marca, SKU ou código..."
              autoComplete="off"
              className="pl-9 pr-9"
            />
            {busca && (
              <button type="button" onClick={() => setBusca('')} aria-label="Limpar busca" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as categorias</SelectItem>
                {categorias.map((c) => (
                  <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <BotaoLeitor onLeitura={lerCodigo} titulo="Encontrar produto pelo código" rotulo="Escanear" somenteIcone className="flex-shrink-0" />
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="icon" className="flex-shrink-0" title="Configurações do estoque">
              <Link href="/admin/estoque/configuracoes" aria-label="Configurações do estoque"><Settings2 className="h-4 w-4" /></Link>
            </Button>
            <Button asChild className="flex-1 sm:flex-none">
              <Link href="/admin/produtos/novo"><Plus className="mr-1.5 h-4 w-4" /> Novo produto</Link>
            </Button>
          </div>
        </div>

        {(arquivados.length > 0 || verArquivados) && (
          <button
            type="button"
            onClick={() => setVerArquivados((v) => !v)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <Archive className="h-4 w-4" />
            {verArquivados ? 'Voltar ao estoque' : `Ver arquivados (${arquivados.length})`}
          </button>
        )}

        {carregando ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Carregando o estoque...</p>
        ) : lista.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-14 text-center text-sm text-muted-foreground">
              <PackageSearch className="h-9 w-9" />
              {produtos.length === 0 ? 'Nenhum produto cadastrado ainda.' : 'Nenhum produto com esses filtros.'}
            </CardContent>
          </Card>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              {verArquivados ? 'Arquivados: ' : ''}{lista.length} produto{lista.length !== 1 ? 's' : ''}
            </p>

            {/* Celular: cartoes. Uma tabela de 9 colunas so rolava de lado. */}
            <ul className="space-y-2 md:hidden">
              {lista.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/produtos/${p.id}/editar`} className="flex gap-3 rounded-xl border border-border bg-card p-3 active:bg-secondary">
                    <Miniatura produto={p} />
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="line-clamp-2 text-sm font-medium leading-snug">{p.nome}</p>
                      <p className="truncate text-xs text-muted-foreground">{p.marca} · SKU {p.sku}</p>
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <SeloEstoque produto={p} />
                        <SeloCanal online={p.exibirNoSite} />
                      </div>
                    </div>
                    <span className="flex-shrink-0 text-sm font-semibold tabular-nums">{formatarPreco(p.precoVendaBalcao ?? p.precoSite)}</span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Computador: tabela. */}
            <Card className="hidden overflow-hidden p-0 md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Produto</th>
                      <th className="px-4 py-3 font-medium">Categoria</th>
                      <th className="px-4 py-3 font-medium">Estoque</th>
                      <th className="px-4 py-3 font-medium">Local</th>
                      <th className="px-4 py-3 text-right font-medium">Balcão</th>
                      <th className="px-4 py-3 text-right font-medium">Site</th>
                      <th className="px-4 py-3 font-medium">Canal</th>
                      <th className="px-4 py-3 font-medium">Mercado Livre</th>
                      <th className="px-4 py-3"><span className="sr-only">Ações</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {lista.map((p) => (
                      <tr key={p.id} className="hover:bg-secondary/40">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-3">
                            <Miniatura produto={p} pequena />
                            <div className="min-w-0">
                              <p className="max-w-[22rem] truncate font-medium" title={p.nome}>{p.nome}</p>
                              <p className="text-xs text-muted-foreground">{p.marca} · <span className="font-mono">{p.sku}</span></p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">{p.categoria}</td>
                        <td className="whitespace-nowrap px-4 py-2.5"><SeloEstoque produto={p} /></td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-xs text-muted-foreground">{p.localizacaoEstoque || '—'}</td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-right tabular-nums">{formatarPreco(p.precoVendaBalcao)}</td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-right tabular-nums">{formatarPreco(p.precoSite)}</td>
                        <td className="whitespace-nowrap px-4 py-2.5"><SeloCanal online={p.exibirNoSite} /></td>
                        <td className="px-4 py-2.5">
                          {p.mercadoLivreStatus === 'sincronizado' ? (
                            <Badge variant="outline" className="border-success/40 text-success">Publicado</Badge>
                          ) : p.mercadoLivreStatus === 'erro' ? (
                            <Badge variant="outline" className="border-destructive/40 text-destructive" title={p.mercadoLivreErro ?? ''}>Erro</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">Não enviado</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex justify-end gap-1">
                            <Button asChild variant="ghost" size="icon" className="h-8 w-8" title="Editar">
                              <Link href={`/admin/produtos/${p.id}/editar`} aria-label={`Editar ${p.nome}`}><Pencil className="h-4 w-4" /></Link>
                            </Button>
                            {isAdmin && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" title="Excluir" onClick={() => setParaExcluir(p)} aria-label={`Excluir ${p.nome}`}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </main>

      <AlertDialog open={!!paraExcluir} onOpenChange={() => setParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {paraExcluir?.nome}?</AlertDialogTitle>
            <AlertDialogDescription>
              Não dá para desfazer. Se o produto já foi usado em venda, compra ou OS, o sistema não deixa excluir — nesse caso desmarque “Exibir no site”.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={excluir}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function Miniatura({ produto, pequena = false }: { produto: ProdutoEstoque; pequena?: boolean }) {
  const tamanho = pequena ? 'h-10 w-10' : 'h-14 w-14';
  // Imagem que nao carrega (link quebrado) vira o icone, em vez do quadro quebrado.
  const [falhou, setFalhou] = useState(false);
  return produto.imagemPrincipal && !falhou ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={produto.imagemPrincipal} alt="" onError={() => setFalhou(true)} className={cn(tamanho, 'flex-shrink-0 rounded-md border border-border bg-white object-contain')} />
  ) : (
    <span className={cn(tamanho, 'flex flex-shrink-0 items-center justify-center rounded-md border border-border bg-secondary')}>
      <Package className="h-5 w-5 text-muted-foreground" />
    </span>
  );
}

function SeloEstoque({ produto }: { produto: ProdutoEstoque }) {
  const situacao = situacaoEstoque(produto);
  return (
    <Badge
      variant="outline"
      className={cn(
        'tabular-nums',
        situacao === 'ok' && 'border-success/40 text-success',
        situacao === 'baixo' && 'border-warning/50 text-warning',
        situacao === 'sem' && 'border-destructive/40 text-destructive'
      )}
      title={produto.estoqueMinimo != null ? `Mínimo: ${produto.estoqueMinimo}` : undefined}
    >
      {situacao === 'sem' ? 'Sem estoque' : `${produto.estoqueAtual} un.`}
      {situacao === 'baixo' && ' · baixo'}
    </Badge>
  );
}

function SeloCanal({ online }: { online: boolean }) {
  return online ? (
    <Badge variant="secondary" className="gap-1"><Globe className="h-3 w-3" /> Loja online</Badge>
  ) : (
    <Badge variant="outline" className="gap-1 text-muted-foreground"><Wrench className="h-3 w-3" /> Só oficina</Badge>
  );
}
