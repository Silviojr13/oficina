'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { deleteProduto, arquivarProduto } from '@/lib/actions/produtos';

// Fim da tela de editar produto: excluir de vez ou arquivar ("saiu de
// linha"). Produto que ja apareceu em venda, compra ou OS nao pode ser
// excluido sem apagar esse historico - ai o sistema oferece arquivar.
export function ExcluirProduto({ id, nome, ativo }: { id: string; nome: string; ativo: boolean }) {
  const router = useRouter();
  const isAdmin = useSession().data?.user?.role === 'admin';
  const [confirmar, setConfirmar] = useState<'excluir' | 'arquivar' | null>(null);
  const [emUso, setEmUso] = useState(false);
  const [enviando, setEnviando] = useState(false);

  if (!isAdmin) return null;

  const voltarAoEstoque = () => router.push('/admin/estoque');

  const excluir = async () => {
    setEnviando(true);
    const resultado = await deleteProduto(id);
    setEnviando(false);
    if (resultado.success) {
      toast.success(`${nome} excluído.`);
      voltarAoEstoque();
      return;
    }
    if ('emUso' in resultado && resultado.emUso) {
      // Troca a confirmacao por "arquivar" na mesma janela.
      setEmUso(true);
      setConfirmar('arquivar');
      return;
    }
    setConfirmar(null);
    toast.error(`Não foi possível excluir: ${resultado.error}`);
  };

  const arquivar = async (arquivarProdutoAgora: boolean) => {
    setEnviando(true);
    const resultado = await arquivarProduto(id, arquivarProdutoAgora);
    setEnviando(false);
    setConfirmar(null);
    if (!resultado.success) {
      toast.error(`Não foi possível ${arquivarProdutoAgora ? 'arquivar' : 'reativar'}: ${resultado.error}`);
      return;
    }
    toast.success(arquivarProdutoAgora ? `${nome} arquivado.` : `${nome} voltou para o estoque.`);
    voltarAoEstoque();
  };

  if (!ativo) {
    return (
      <Card className="border-warning/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Archive className="h-4 w-4" /> Produto arquivado</CardTitle>
          <CardDescription>Ele não aparece no estoque, nas buscas nem na loja. O histórico de vendas e OS continua.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" variant="outline" onClick={() => arquivar(false)} disabled={enviando} className="w-full sm:w-auto">
            <ArchiveRestore className="mr-2 h-4 w-4" /> Reativar produto
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base">Tirar do estoque</CardTitle>
          <CardDescription>
            Saiu de linha ou mudou o código? <strong>Arquive</strong> e cadastre o novo: o antigo some do estoque e da loja, mas continua
            nas vendas e OS antigas. <strong>Excluir</strong> apaga de vez e só funciona se o produto nunca foi usado.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" variant="outline" onClick={() => setConfirmar('arquivar')}>
            <Archive className="mr-2 h-4 w-4" /> Arquivar (saiu de linha)
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => {
              setEmUso(false);
              setConfirmar('excluir');
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Excluir produto
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={!!confirmar} onOpenChange={(aberto) => !aberto && setConfirmar(null)}>
        <AlertDialogContent>
          {confirmar === 'excluir' ? (
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir {nome}?</AlertDialogTitle>
              <AlertDialogDescription>O produto é apagado de vez. Não dá para desfazer.</AlertDialogDescription>
            </AlertDialogHeader>
          ) : (
            <AlertDialogHeader>
              <AlertDialogTitle>Arquivar {nome}?</AlertDialogTitle>
              <AlertDialogDescription>
                {emUso && 'Este produto já aparece em vendas, compras ou OS, então não pode ser excluído. '}
                Ele sai do estoque, das buscas e da loja online, mas fica no histórico. Dá para reativar depois na aba Estoque, em “Arquivados”.
              </AlertDialogDescription>
            </AlertDialogHeader>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={enviando}>Cancelar</AlertDialogCancel>
            {confirmar === 'excluir' ? (
              <Button type="button" variant="destructive" onClick={excluir} disabled={enviando}>
                {enviando ? 'Excluindo...' : 'Excluir'}
              </Button>
            ) : (
              <AlertDialogAction onClick={() => arquivar(true)} disabled={enviando}>
                {enviando ? 'Arquivando...' : 'Arquivar'}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
