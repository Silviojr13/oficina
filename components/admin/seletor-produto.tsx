'use client';

import { useMemo, useState } from 'react';
import { Search, ScanBarcode, X, Minus, Plus, PackageSearch, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LeitorCodigoBarras } from '@/components/admin/leitor-codigo-barras';
import { encontrarProdutoPorCodigo } from '@/lib/produto-codigo';
import { cn } from '@/lib/utils';
import { textoDeBusca, combinaBusca } from '@/lib/busca';

export type ProdutoSelecionavel = {
  id: string;
  nome: string;
  marca?: string | null;
  categoria?: string | null;
  sku?: string | null;
  codigoBarras?: string | null;
  codigoOEM?: string | null;
  estoqueAtual: number;
  estoqueMinimo?: number | null;
  precoVendaBalcao?: number | null;
  precoSite?: number | null;
};

// Lista grande demais trava no celular e nao ajuda ninguem: acima disso,
// pede pra refinar a busca.
const LIMITE_RESULTADOS = 60;


function formatarPreco(valor: number | null | undefined) {
  return `R$ ${(valor ?? 0).toFixed(2).replace('.', ',')}`;
}

interface SeletorProdutoProps<T extends ProdutoSelecionavel> {
  produtos: T[];
  onAdicionar: (produto: T, quantidade: number) => void;
  // Quantidade que ja esta na lista da tela, pra mostrar "ja na OS: 2".
  quantidadeNaLista?: (produtoId: string) => number;
  titulo?: string;
  rotuloBotao?: string;
  rotuloConfirmar?: string;
}

export function SeletorProduto<T extends ProdutoSelecionavel>({
  rotuloBotao = 'Adicionar peça',
  ...props
}: SeletorProdutoProps<T>) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <Button type="button" onClick={() => setAberto(true)} className="w-full sm:w-auto">
        <Plus className="mr-1.5 h-4 w-4" /> {rotuloBotao}
      </Button>
      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="flex max-h-[92vh] max-w-[calc(100%-1rem)] flex-col gap-3 p-4 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{props.titulo ?? 'Adicionar peça'}</DialogTitle>
            <DialogDescription>Busque pelo nome, marca, SKU ou código — ou escaneie a etiqueta.</DialogDescription>
          </DialogHeader>
          {/* So existe com o dialogo aberto: cada abertura comeca com a busca limpa. */}
          <PainelBusca {...props} onFechar={() => setAberto(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

function PainelBusca<T extends ProdutoSelecionavel>({
  produtos,
  onAdicionar,
  quantidadeNaLista,
  rotuloConfirmar = 'Adicionar à OS',
  onFechar,
}: Omit<SeletorProdutoProps<T>, 'rotuloBotao' | 'titulo'> & { onFechar: () => void }) {
  const [busca, setBusca] = useState('');
  const [selecionado, setSelecionado] = useState<T | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [leitorAberto, setLeitorAberto] = useState(false);
  const [avisoLeitura, setAvisoLeitura] = useState('');

  // Cada produto vira um texto unico de busca; todas as palavras digitadas
  // precisam aparecer ("pastilha bosch" acha so as pastilhas da Bosch).
  const indice = useMemo(
    () =>
      produtos.map((p) => ({
        produto: p,
        texto: textoDeBusca(p.nome, p.marca, p.categoria, p.sku, p.codigoBarras, p.codigoOEM),
      })),
    [produtos]
  );

  const encontrados = useMemo(() => {
    const lista = busca.trim() ? indice.filter(({ texto }) => combinaBusca(texto, busca)) : indice;
    return lista.map(({ produto }) => produto).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }, [indice, busca]);

  const escolher = (produto: T) => {
    setSelecionado(produto);
    setQuantidade(1);
    setAvisoLeitura('');
  };

  const lerCodigo = (codigo: string) => {
    const produto = encontrarProdutoPorCodigo(produtos, codigo);
    if (produto) {
      escolher(produto);
    } else {
      setBusca('');
      setAvisoLeitura(`Código ${codigo} não está cadastrado em nenhum produto.`);
    }
  };

  const confirmar = () => {
    if (!selecionado || quantidade < 1) return;
    onAdicionar(selecionado, quantidade);
    onFechar();
  };

  if (selecionado) {
    const preco = selecionado.precoVendaBalcao || selecionado.precoSite;
    const jaNaLista = quantidadeNaLista?.(selecionado.id) ?? 0;
    const restante = selecionado.estoqueAtual - jaNaLista - quantidade;

    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-border p-3">
          <p className="font-medium leading-tight">{selecionado.nome}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {[selecionado.marca, selecionado.sku && `SKU ${selecionado.sku}`].filter(Boolean).join(' · ')}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <SituacaoEstoque produto={selecionado} />
            <span className="font-semibold tabular-nums">{formatarPreco(preco)}</span>
            {jaNaLista > 0 && <span className="text-muted-foreground">· já na lista: {jaNaLista}</span>}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium">Quantidade</span>
          <div className="flex items-center gap-1">
            <Button type="button" variant="outline" size="icon" onClick={() => setQuantidade((q) => Math.max(1, q - 1))} aria-label="Diminuir">
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              id="quantidadePeca"
              type="number"
              min={1}
              inputMode="numeric"
              value={quantidade}
              onChange={(e) => setQuantidade(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-16 text-center tabular-nums"
            />
            <Button type="button" variant="outline" size="icon" onClick={() => setQuantidade((q) => q + 1)} aria-label="Aumentar">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="font-semibold tabular-nums">{formatarPreco((preco ?? 0) * quantidade)}</span>
        </div>

        {restante < 0 && (
          <p className="rounded-md bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
            Isso passa do estoque atual ({selecionado.estoqueAtual} un.). Dá para lançar mesmo assim; o estoque fica negativo até a próxima compra.
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button type="button" variant="ghost" onClick={() => setSelecionado(null)}>
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Escolher outra
          </Button>
          <Button type="button" onClick={confirmar}>
            {rotuloConfirmar}
          </Button>
        </div>
      </div>
    );
  }

  const visiveis = encontrados.slice(0, LIMITE_RESULTADOS);

  return (
    <>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="buscaPeca"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setAvisoLeitura('');
            }}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              e.preventDefault();
              if (encontrados.length === 1) escolher(encontrados[0]);
            }}
            placeholder="Ex.: pastilha bosch, filtro óleo, 7891..."
            autoComplete="off"
            autoFocus
            className="pl-9 pr-9"
          />
          {busca && (
            <button
              type="button"
              onClick={() => setBusca('')}
              aria-label="Limpar busca"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button type="button" variant="outline" onClick={() => setLeitorAberto(true)}>
          <ScanBarcode className="h-4 w-4 sm:mr-1.5" />
          <span className="hidden sm:inline">Escanear</span>
        </Button>
      </div>

      {avisoLeitura && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{avisoLeitura}</p>}

      <p className="text-xs text-muted-foreground">
        {encontrados.length === 0
          ? 'Nenhum produto encontrado.'
          : encontrados.length > LIMITE_RESULTADOS
            ? `${encontrados.length} produtos — mostrando ${LIMITE_RESULTADOS}. Digite mais para filtrar.`
            : `${encontrados.length} produto${encontrados.length > 1 ? 's' : ''}`}
      </p>

      <div className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1">
        {visiveis.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
            <PackageSearch className="h-8 w-8" />
            Tente outra palavra, o SKU ou escaneie a etiqueta.
          </div>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {visiveis.map((produto) => (
              <li key={produto.id}>
                <button
                  type="button"
                  onClick={() => escolher(produto)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none"
                >
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-sm font-medium leading-snug">{produto.nome}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {[produto.marca, produto.sku && `SKU ${produto.sku}`].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                  <span className="flex flex-shrink-0 flex-col items-end gap-1">
                    <span className="text-sm font-semibold tabular-nums">{formatarPreco(produto.precoVendaBalcao || produto.precoSite)}</span>
                    <SituacaoEstoque produto={produto} compacto />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <LeitorCodigoBarras aberto={leitorAberto} onAbertoChange={setLeitorAberto} onLeitura={lerCodigo} titulo="Escanear peça" />
    </>
  );
}

function SituacaoEstoque({ produto, compacto = false }: { produto: ProdutoSelecionavel; compacto?: boolean }) {
  const minimo = produto.estoqueMinimo ?? 0;
  const situacao = produto.estoqueAtual <= 0 ? 'sem' : produto.estoqueAtual <= minimo ? 'baixo' : 'ok';
  return (
    <Badge
      variant="outline"
      className={cn(
        'tabular-nums',
        compacto && 'px-1.5 py-0 text-[11px]',
        situacao === 'ok' && 'border-green-500/40 text-green-700 dark:text-green-400',
        situacao === 'baixo' && 'border-amber-500/40 text-amber-700 dark:text-amber-400',
        situacao === 'sem' && 'border-destructive/40 text-destructive'
      )}
    >
      {situacao === 'sem' ? 'Sem estoque' : `${produto.estoqueAtual} em estoque`}
    </Badge>
  );
}
