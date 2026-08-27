import { AdminHeader } from '@/components/admin-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { isConectado } from '@/lib/mercado-livre';
import { CheckCircle2, XCircle } from 'lucide-react';

export default async function IntegracoesPage({
  searchParams,
}: {
  searchParams: Promise<{ conectado?: string; erro?: string }>;
}) {
  const params = await searchParams;
  const conectado = await isConectado();

  return (
    <div className="space-y-6">
      <AdminHeader title="Integrações" subtitle="Conecte o sistema a canais de venda externos" />

      {params.conectado && (
        <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
          Conta do Mercado Livre conectada com sucesso.
        </div>
      )}
      {params.erro && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          Erro ao conectar: {params.erro}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Mercado Livre
            {conectado ? (
              <Badge variant="default" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Conectado</Badge>
            ) : (
              <Badge variant="outline" className="gap-1"><XCircle className="h-3 w-3" /> Não conectado</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Quando conectado, todo produto cadastrado com preço e estoque definidos é publicado
            automaticamente como anúncio no Mercado Livre.
          </p>
          <a href="/api/mercado-livre/connect">
            <Button>{conectado ? 'Reconectar conta do Mercado Livre' : 'Conectar ao Mercado Livre'}</Button>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
