'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CheckCircle2, Circle, Copy, ExternalLink, Eye, EyeOff, Pencil, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { salvarCredenciaisMercadoLivre, getStatusMercadoLivre } from '@/lib/mercado-livre';
import { cn } from '@/lib/utils';

type Status = Awaited<ReturnType<typeof getStatusMercadoLivre>>;

// Passo a passo para ligar a loja ao Mercado Livre: criar o aplicativo la,
// colar as credenciais aqui e autorizar. Antes o botao "Conectar" so
// mostrava um JSON de erro porque as credenciais nunca tinham sido
// configuradas.
export function ConfigurarMercadoLivre({ status }: { status: Status }) {
  const router = useRouter();
  const [editando, setEditando] = useState(!status.configurado);
  const [clientId, setClientId] = useState(status.clientId ?? '');
  const [clientSecret, setClientSecret] = useState('');
  const [mostrarSecret, setMostrarSecret] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const copiar = async (texto: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      toast.success('Copiado.');
    } catch {
      toast.error('Não deu para copiar. Selecione o texto e copie à mão.');
    }
  };

  const salvar = async () => {
    setSalvando(true);
    const resultado = await salvarCredenciaisMercadoLivre({ clientId, clientSecret });
    setSalvando(false);
    if (!resultado.success) {
      toast.error(resultado.error);
      return;
    }
    toast.success('Credenciais salvas. Agora toque em Conectar.');
    setClientSecret('');
    setEditando(false);
    router.refresh();
  };

  const passo1Ok = status.configurado;
  const passo2Ok = status.conectado;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          Mercado Livre
          {status.conectado ? (
            <Badge variant="outline" className="gap-1 border-success/40 text-success"><CheckCircle2 className="h-3 w-3" /> Conectado</Badge>
          ) : (
            <Badge variant="outline" className="gap-1"><XCircle className="h-3 w-3" /> Não conectado</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Conectado, todo produto cadastrado com preço e estoque é publicado como anúncio no Mercado Livre.
          {status.contaId && ` Conta vendedora nº ${status.contaId}.`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Passo 1 */}
        <Passo numero={1} feito={passo1Ok} titulo="Criar o aplicativo no Mercado Livre">
          {status.origem === 'vercel' ? (
            <p className="text-sm text-muted-foreground">
              As credenciais já estão configuradas na Vercel (Client ID {status.clientId}). Para trocar, altere as variáveis
              MERCADOLIVRE_CLIENT_ID e MERCADOLIVRE_CLIENT_SECRET lá.
            </p>
          ) : !editando ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                Credenciais salvas. Client ID <span className="font-mono text-foreground">{status.clientId}</span>.
              </p>
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditando(true)}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" /> Trocar
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <ol className="list-decimal space-y-2 pl-5 text-sm">
                <li>
                  Entre com a <strong>conta do Mercado Livre que vai vender</strong> e abra o painel de desenvolvedores:
                  <a
                    href="https://developers.mercadolivre.com.br/devcenter"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 inline-flex items-center gap-1 font-medium text-primary underline"
                  >
                    developers.mercadolivre.com.br <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </li>
                <li>Toque em <strong>Criar uma aplicação</strong>. Nome e descrição podem ser o nome da sua loja.</li>
                <li>
                  No campo <strong>URI de redirect</strong>, cole exatamente este endereço:
                  <div className="mt-1.5 flex gap-2">
                    <code className="min-w-0 flex-1 break-all rounded-md border border-border bg-secondary px-3 py-2 font-mono text-xs">
                      {status.redirectUri}
                    </code>
                    <Button type="button" variant="outline" size="icon" onClick={() => copiar(status.redirectUri)} aria-label="Copiar endereço">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
                <li>Em <strong>Escopos</strong>, marque <strong>leitura e escrita</strong> e <strong>acesso offline</strong>. Sem o acesso offline a conexão cai a cada 6 horas.</li>
                <li>
                  Em <strong>Configuração de notificações</strong>, no campo <strong>URL de retornos de chamada de notificação</strong>, cole:
                  <div className="mt-1.5 flex gap-2">
                    <code className="min-w-0 flex-1 break-all rounded-md border border-border bg-secondary px-3 py-2 font-mono text-xs">
                      {status.urlNotificacoes}
                    </code>
                    <Button type="button" variant="outline" size="icon" onClick={() => copiar(status.urlNotificacoes)} aria-label="Copiar endereço de notificações">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="mt-1 block text-muted-foreground">
                    E marque os tópicos <strong>Orders</strong> (vendas) e <strong>Questions</strong> (perguntas): venda paga entra em Vendas e baixa o estoque; pergunta aparece em Mensagens.
                  </span>
                </li>
                <li>Salve. O Mercado Livre mostra o <strong>Client ID</strong> (ou App ID) e o <strong>Client Secret</strong> (ou Secret Key). Copie e cole abaixo.</li>
              </ol>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="mlClientId">Client ID</Label>
                  <Input id="mlClientId" inputMode="numeric" className="font-mono" placeholder="Ex.: 1234567890123456" autoComplete="off" value={clientId} onChange={(e) => setClientId(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mlClientSecret">Client Secret</Label>
                  <div className="relative">
                    <Input
                      id="mlClientSecret"
                      type={mostrarSecret ? 'text' : 'password'}
                      className="pr-10 font-mono"
                      placeholder="Cole a Secret Key"
                      autoComplete="off"
                      value={clientSecret}
                      onChange={(e) => setClientSecret(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSecret((v) => !v)}
                      aria-label={mostrarSecret ? 'Esconder' : 'Mostrar'}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                    >
                      {mostrarSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" onClick={salvar} disabled={salvando || !clientId.trim() || !clientSecret.trim()}>
                  {salvando ? 'Salvando...' : 'Salvar credenciais'}
                </Button>
                {status.configurado && (
                  <Button type="button" variant="ghost" onClick={() => setEditando(false)}>Cancelar</Button>
                )}
              </div>
            </div>
          )}
        </Passo>

        {/* Passo 2 */}
        <Passo numero={2} feito={passo2Ok} titulo="Autorizar a conta" desabilitado={!passo1Ok}>
          <p className="mb-3 text-sm text-muted-foreground">
            Abre o Mercado Livre para você autorizar o sistema a publicar anúncios na sua conta. Depois volta para cá sozinho.
          </p>
          {passo1Ok ? (
            <Button asChild variant={status.conectado ? 'outline' : 'default'}>
              <a href="/api/mercado-livre/connect">{status.conectado ? 'Reconectar conta' : 'Conectar ao Mercado Livre'}</a>
            </Button>
          ) : (
            <Button disabled>Conectar ao Mercado Livre</Button>
          )}
        </Passo>
      </CardContent>
    </Card>
  );
}

function Passo({
  numero,
  titulo,
  feito,
  desabilitado,
  children,
}: {
  numero: number;
  titulo: string;
  feito: boolean;
  desabilitado?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={cn('flex gap-3', desabilitado && 'opacity-60')}>
      <span className="mt-0.5 flex-shrink-0">
        {feito ? <CheckCircle2 className="h-5 w-5 text-success" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="mb-2 font-medium">
          {numero}. {titulo}
        </h3>
        {children}
      </div>
    </section>
  );
}
