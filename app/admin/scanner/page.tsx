'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ScanBarcode, MapPin, Pencil, ShoppingCart, PackagePlus, PackageSearch, History } from 'lucide-react';
import { AdminHeader } from '@/components/admin-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LeitorCodigoBarras } from '@/components/admin/leitor-codigo-barras';
import { buscarProdutoPorCodigo } from '@/lib/actions/produtos';
import { cn } from '@/lib/utils';

type ProdutoLido = NonNullable<Awaited<ReturnType<typeof buscarProdutoPorCodigo>>>;
type Leitura = { codigo: string; produto: ProdutoLido | null; em: Date };

function formatarPreco(valor: number | null | undefined) {
  return valor ? `R$ ${valor.toFixed(2).replace('.', ',')}` : '—';
}

export default function ScannerPage() {
  const [leitorAberto, setLeitorAberto] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [atual, setAtual] = useState<Leitura | null>(null);
  const [historico, setHistorico] = useState<Leitura[]>([]);

  const consultar = async (codigo: string) => {
    setBuscando(true);
    const produto = await buscarProdutoPorCodigo(codigo);
    const leitura = { codigo, produto, em: new Date() };
    setAtual(leitura);
    setHistorico((anteriores) => [leitura, ...anteriores.filter((l) => l.codigo !== codigo)].slice(0, 6));
    setBuscando(false);
  };

  return (
    <>
      <AdminHeader title="Scanner" subtitle="Consulte uma peça pelo código de barras" />
      <main className="p-4 sm:p-6 space-y-6 max-w-2xl">
        <Button size="lg" className="h-14 w-full text-base" onClick={() => setLeitorAberto(true)}>
          <ScanBarcode className="mr-2 h-5 w-5" /> Escanear produto
        </Button>

        {buscando && <p className="text-center text-sm text-muted-foreground">Procurando o produto...</p>}

        {!buscando && atual?.produto && <CartaoProduto produto={atual.produto} codigo={atual.codigo} />}

        {!buscando && atual && !atual.produto && (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
              <PackageSearch className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="font-medium">Nenhum produto com este código</p>
                <p className="font-mono text-sm text-muted-foreground">{atual.codigo}</p>
              </div>
              <Button asChild>
                <Link href={`/admin/produtos/novo?codigoBarras=${encodeURIComponent(atual.codigo)}`}>
                  <PackagePlus className="mr-2 h-4 w-4" /> Cadastrar produto com este código
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {!atual && !buscando && (
          <p className="text-center text-sm text-muted-foreground">
            Aponte a câmera para a etiqueta da peça: o código de barras do fabricante (EAN), o SKU ou o código OEM.
          </p>
        )}

        {historico.length > 1 && (
          <section className="space-y-2">
            <h2 className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <History className="h-4 w-4" /> Lidos agora há pouco
            </h2>
            <div className="divide-y divide-border rounded-lg border border-border">
              {historico.slice(1).map((leitura) => (
                <button
                  key={leitura.codigo}
                  type="button"
                  onClick={() => setAtual(leitura)}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-secondary"
                >
                  <span className="min-w-0 truncate">{leitura.produto?.nome ?? 'Não cadastrado'}</span>
                  <span className="flex-shrink-0 font-mono text-xs text-muted-foreground">{leitura.codigo}</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>

      <LeitorCodigoBarras aberto={leitorAberto} onAbertoChange={setLeitorAberto} onLeitura={consultar} titulo="Escanear produto" />
    </>
  );
}

function CartaoProduto({ produto, codigo }: { produto: ProdutoLido; codigo: string }) {
  const minimo = produto.estoqueMinimo ?? 0;
  const situacao =
    produto.estoqueAtual <= 0 ? 'sem' : produto.estoqueAtual <= minimo ? 'baixo' : 'ok';
  const localizacao = [produto.setorAlmoxarifado, produto.localizacaoEstoque].filter(Boolean).join(' · ');

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="flex gap-4">
          {produto.imagemPrincipal ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={produto.imagemPrincipal} alt="" className="h-20 w-20 flex-shrink-0 rounded-md border border-border object-cover" />
          ) : (
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-md border border-border bg-secondary">
              <PackageSearch className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0 space-y-1">
            <p className="font-semibold leading-tight">{produto.nome}</p>
            <p className="text-sm text-muted-foreground">{produto.marca}</p>
            <p className="font-mono text-xs text-muted-foreground">
              SKU {produto.sku}
              {produto.codigoBarras && ` · EAN ${produto.codigoBarras}`}
              {produto.codigoOEM && ` · OEM ${produto.codigoOEM}`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted-foreground">Em estoque</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums">{produto.estoqueAtual}</span>
              <Badge
                variant="outline"
                className={cn(
                  situacao === 'ok' && 'border-green-500/40 text-green-700 dark:text-green-400',
                  situacao === 'baixo' && 'border-amber-500/40 text-amber-700 dark:text-amber-400',
                  situacao === 'sem' && 'border-destructive/40 text-destructive'
                )}
              >
                {situacao === 'ok' ? 'OK' : situacao === 'baixo' ? 'Baixo' : 'Sem estoque'}
              </Badge>
            </div>
            {produto.estoqueMinimo != null && <p className="mt-0.5 text-xs text-muted-foreground">Mínimo: {produto.estoqueMinimo}</p>}
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted-foreground">Preço balcão</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{formatarPreco(produto.precoVendaBalcao ?? produto.precoSite)}</p>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-md bg-secondary px-3 py-2 text-sm">
          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <span>{localizacao || 'Local no estoque não informado'}</span>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button asChild variant="outline">
            <Link href={`/admin/produtos/${produto.id}/editar`}>
              <Pencil className="mr-2 h-4 w-4" /> Editar produto
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/admin/vendas/nova?produto=${produto.id}`}>
              <ShoppingCart className="mr-2 h-4 w-4" /> Vender esta peça
            </Link>
          </Button>
        </div>

        <p className="text-right font-mono text-[11px] text-muted-foreground">lido: {codigo}</p>
      </CardContent>
    </Card>
  );
}
