import { headers } from 'next/headers';
import { AdminHeader } from '@/components/admin-header';
import { getStatusMercadoLivre } from '@/lib/mercado-livre';
import { ConfigurarMercadoLivre } from '@/components/admin/configurar-mercado-livre';

export default async function IntegracoesPage({
  searchParams,
}: {
  searchParams: Promise<{ conectado?: string; erro?: string }>;
}) {
  const params = await searchParams;
  // O endereco de retorno do Mercado Livre sai do dominio em que o site esta
  // aberto (producao ou preview), para o passo a passo mostrar o valor certo.
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const protocolo = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  const status = await getStatusMercadoLivre(`${protocolo}://${host}`);

  return (
    <>
      <AdminHeader title="Integrações" subtitle="Conecte o sistema a canais de venda externos" />
      <main className="max-w-3xl space-y-4 p-4 sm:p-6">
        {params.conectado && (
          <div className="rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success">
            Conta do Mercado Livre conectada. Os produtos com preço e estoque passam a ser publicados ao cadastrar.
          </div>
        )}
        {params.erro && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{params.erro}</div>
        )}
        <ConfigurarMercadoLivre status={status} />
      </main>
    </>
  );
}
