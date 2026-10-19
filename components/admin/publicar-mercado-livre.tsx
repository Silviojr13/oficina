'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { ExternalLink, RefreshCw, Upload, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { publicarNoMercadoLivre } from '@/lib/actions/produtos';

type DadosProduto = {
  id: string;
  nome: string;
  estoqueAtual?: number | null;
  precoSite?: number | null;
  precoVendaBalcao?: number | null;
  imagemPrincipal?: string | null;
  mercadoLivreId?: string | null;
  mercadoLivreStatus?: string | null;
  mercadoLivreErro?: string | null;
};

// "MLB1234567890" -> pagina publica do anuncio.
function linkDoAnuncio(id: string) {
  return `https://produto.mercadolivre.com.br/${id.replace(/^MLB/, 'MLB-')}`;
}

// Bloco da tela do produto para publicar no Mercado Livre (ou atualizar
// preco e estoque de um anuncio que ja existe).
export function PublicarMercadoLivre({ produto }: { produto: DadosProduto }) {
  const isAdmin = useSession().data?.user?.role === 'admin';
  const [estado, setEstado] = useState({
    id: produto.mercadoLivreId ?? null,
    status: produto.mercadoLivreStatus ?? null,
    erro: produto.mercadoLivreErro ?? null,
  });
  const [confirmar, setConfirmar] = useState(false);
  const [enviando, setEnviando] = useState(false);

  if (!isAdmin) return null;

  const preco = produto.precoSite || produto.precoVendaBalcao || 0;
  const estoque = produto.estoqueAtual ?? 0;
  const temFoto = !!produto.imagemPrincipal && /^https?:\/\//.test(produto.imagemPrincipal);
  const pendencias = [
    !preco && 'sem preço de venda',
    estoque <= 0 && 'sem estoque',
  ].filter(Boolean) as string[];

  const publicar = async () => {
    setEnviando(true);
    const r = await publicarNoMercadoLivre(produto.id);
    setEnviando(false);
    setConfirmar(false);
    if (r.success) {
      const novoId = ('mercadoLivreId' in r && r.mercadoLivreId) || estado.id;
      setEstado({ id: novoId ?? null, status: 'sincronizado', erro: null });
      toast.success(r.acao === 'atualizado' ? 'Preço e estoque atualizados no Mercado Livre.' : 'Produto publicado no Mercado Livre.');
    } else {
      setEstado((e) => ({ ...e, status: 'erro', erro: r.error ?? 'Erro desconhecido' }));
      toast.error('O Mercado Livre não aceitou. Veja o motivo no bloco Mercado Livre.');
    }
  };

  const publicado = !!estado.id;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            Mercado Livre
            {publicado && estado.status !== 'erro' && <CheckCircle2 className="h-4 w-4 text-success" />}
          </CardTitle>
          <CardDescription>
            {publicado
              ? 'Este produto tem anúncio no Mercado Livre. O botão abaixo atualiza preço e estoque lá.'
              : 'Ainda não está no Mercado Livre.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {estado.status === 'erro' && estado.erro && (
            <p className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span className="min-w-0 break-words">{estado.erro}</span>
            </p>
          )}
          {!publicado && pendencias.length > 0 && (
            <p className="text-sm text-warning">Para publicar falta: {pendencias.join(' e ')}. Salve o produto com esses dados primeiro.</p>
          )}
          {!publicado && !temFoto && (
            <p className="text-sm text-muted-foreground">Dica: o Mercado Livre costuma exigir foto. Preencha o “Link da foto” em Loja online.</p>
          )}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" onClick={() => setConfirmar(true)} disabled={enviando || (!publicado && pendencias.length > 0)}>
              {publicado ? <RefreshCw className="mr-2 h-4 w-4" /> : <Upload className="mr-2 h-4 w-4" />}
              {publicado ? 'Atualizar preço e estoque' : 'Publicar no Mercado Livre'}
            </Button>
            {publicado && (
              <Button asChild variant="outline">
                <a href={linkDoAnuncio(estado.id!)} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" /> Ver anúncio
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={confirmar} onOpenChange={setConfirmar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{publicado ? 'Atualizar o anúncio?' : 'Publicar no Mercado Livre?'}</AlertDialogTitle>
            <AlertDialogDescription>
              {publicado
                ? `O anúncio passa a ter preço R$ ${preco.toFixed(2).replace('.', ',')} e ${estoque} unidade(s).`
                : `“${produto.nome}” vira um anúncio de verdade na sua conta, por R$ ${preco.toFixed(2).replace('.', ',')}, com ${estoque} unidade(s). Compradores já podem comprar.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={enviando}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); publicar(); }} disabled={enviando}>
              {enviando ? 'Enviando...' : publicado ? 'Atualizar' : 'Publicar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
