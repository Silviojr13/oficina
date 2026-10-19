'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { AdminHeader } from '@/components/admin-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getConfigEstoque, salvarConfigEstoque, type ConfigEstoque } from '@/lib/actions/configuracoes';
import { cn } from '@/lib/utils';

export default function ConfiguracoesEstoquePage() {
  const isAdmin = useSession().data?.user?.role === 'admin';
  const [config, setConfig] = useState<ConfigEstoque | null>(null);
  const [novaMargem, setNovaMargem] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    getConfigEstoque().then(setConfig);
  }, []);

  if (!config) {
    return (
      <>
        <AdminHeader title="Configurações do estoque" subtitle="Carregando..." />
        <main className="p-4 sm:p-6 text-sm text-muted-foreground">Carregando...</main>
      </>
    );
  }

  const adicionarMargem = () => {
    const m = parseFloat(novaMargem.replace(',', '.'));
    if (!Number.isFinite(m) || m < 0) return;
    setConfig({ ...config, margensRapidas: Array.from(new Set([...config.margensRapidas, m])).sort((a, b) => a - b) });
    setNovaMargem('');
  };

  const salvar = async () => {
    setSalvando(true);
    const resultado = await salvarConfigEstoque(config);
    setSalvando(false);
    if (resultado.success) toast.success('Configurações salvas.');
    else toast.error(`Não foi possível salvar: ${resultado.error}`);
  };

  return (
    <>
      <AdminHeader title="Configurações do estoque" subtitle="Margens de lucro usadas no cadastro de produto" />
      <main className="max-w-2xl space-y-4 p-4 sm:p-6">
        <Link href="/admin/estoque" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar ao estoque
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Margem padrão</CardTitle>
            <CardDescription>Já vem marcada ao cadastrar um produto novo. O preço de venda é o custo mais essa porcentagem.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="margemPadrao">Margem padrão (%)</Label>
            <div className="relative w-40">
              <Input
                id="margemPadrao"
                type="number"
                step="0.1"
                inputMode="decimal"
                value={config.margemPadrao}
                disabled={!isAdmin}
                onChange={(e) => setConfig({ ...config, margemPadrao: parseFloat(e.target.value) || 0 })}
                className="pr-7"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Exemplo: custo R$ 20,00 com {config.margemPadrao}% vira preço de R$ {(20 * (1 + config.margemPadrao / 100)).toFixed(2).replace('.', ',')}.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Margens rápidas</CardTitle>
            <CardDescription>Os botões de porcentagem que aparecem no cadastro, para escolher com um toque.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {config.margensRapidas.map((m) => (
                <span
                  key={m}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium',
                    m === config.margemPadrao ? 'border-primary bg-primary/10 text-primary' : 'border-border'
                  )}
                >
                  {m}%
                  {isAdmin && (
                    <button
                      type="button"
                      aria-label={`Remover ${m}%`}
                      onClick={() => setConfig({ ...config, margensRapidas: config.margensRapidas.filter((x) => x !== m) })}
                      className="rounded-full p-0.5 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </span>
              ))}
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <div className="relative w-32">
                  <Input
                    id="novaMargem"
                    inputMode="decimal"
                    placeholder="Ex.: 35"
                    value={novaMargem}
                    onChange={(e) => setNovaMargem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        adicionarMargem();
                      }
                    }}
                    className="pr-7"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                </div>
                <Button type="button" variant="outline" onClick={adicionarMargem}>
                  <Plus className="mr-1.5 h-4 w-4" /> Adicionar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {isAdmin ? (
          <Button onClick={salvar} disabled={salvando} className="w-full sm:w-auto">
            {salvando ? 'Salvando...' : 'Salvar configurações'}
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">Só o admin pode alterar as margens.</p>
        )}
      </main>
    </>
  );
}
