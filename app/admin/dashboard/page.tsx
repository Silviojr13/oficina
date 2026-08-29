'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  CreditCard,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Wrench,
  Clock3,
  PackageSearch,
  CircleDollarSign,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AdminHeader } from '@/components/admin-header'
import { getOrdensServico } from '@/lib/actions/ordens-servico'
import { getProdutos } from '@/lib/actions/produtos'
import {
  getDashboardKPIs,
  getMovimentacoesRecentes,
  getVendasUltimosDias,
  getTopProdutosMes,
  getVendasPorCategoria,
} from '@/lib/actions/dashboard'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const statusLabels: Record<string, string> = {
  aberto: 'Aberta',
  em_andamento: 'Em andamento',
  aguardando_peca: 'Aguardando peça',
  aguardando_aprovacao: 'Aguardando aprovação',
  concluido: 'Concluída',
  entregue: 'Entregue',
  cancelado: 'Cancelada',
}

const COLORS = ['#F97316', '#22C55E', '#3B82F6', '#EAB308', '#8B5CF6', '#6B7280']

const dashboardKPIsPadrao = {
  vendasHoje: 0, pedidosHoje: 0, vendasMes: 0, variacaoMes: 0, ticketMedio: 0,
  produtosEmFalta: 0, contasAPagar: 0, cmvMes: 0, margemBruta: 0,
}

export default function DashboardPage() {
  const [ordens, setOrdens] = useState<any[]>([])
  const [produtos, setProdutos] = useState<any[]>([])
  const [kpis, setKpis] = useState(dashboardKPIsPadrao)
  const [movimentacoesRecentes, setMovimentacoesRecentes] = useState<any[]>([])
  const [vendasUltimosDias, setVendasUltimosDias] = useState<{ data: string; valor: number }[]>([])
  const [topProdutosMes, setTopProdutosMes] = useState<{ nome: string; quantidade: number; valor: number }[]>([])
  const [vendasPorCategoria, setVendasPorCategoria] = useState<{ categoria: string; valor: number; cor: string }[]>([])

  useEffect(() => {
    getOrdensServico(1, 1000).then((res) => setOrdens(res.data))
    getProdutos(1, 1000).then((res) => setProdutos(res.data))
    getDashboardKPIs().then(setKpis)
    getMovimentacoesRecentes(8).then(setMovimentacoesRecentes)
    getVendasUltimosDias(30).then(setVendasUltimosDias)
    getTopProdutosMes(10).then(setTopProdutosMes)
    getVendasPorCategoria().then(setVendasPorCategoria)
  }, [])

  const produtosBaixoEstoque = produtos.filter((p) => p.estoqueAtual <= p.estoqueMinimo)

  const ordensAtivas = ordens.filter((o) => !['entregue', 'cancelado'].includes(o.status))
  const aguardandoPeca = ordens.filter((o) => o.status === 'aguardando_peca').length
  const concluidasHoje = ordens.filter((o) => o.status === 'concluido' || o.status === 'entregue').length
  const valorEmAberto = ordensAtivas.reduce((sum, o) => sum + o.valorTotal, 0)
  const ultimasAtivas = [...ordensAtivas]
    .sort((a, b) => new Date(b.dataEntrada).getTime() - new Date(a.dataEntrada).getTime())
    .slice(0, 5)

  const kpiCards = [
    {
      title: 'Vendas Hoje',
      value: `R$ ${kpis.vendasHoje.toFixed(2).replace('.', ',')}`,
      subtitle: `${kpis.pedidosHoje} pedidos`,
      icon: DollarSign,
      trend: null as 'up' | 'down' | null,
    },
    {
      title: 'Vendas do Mês',
      value: `R$ ${(kpis.vendasMes / 1000).toFixed(1)}k`,
      subtitle: `${kpis.variacaoMes > 0 ? '+' : ''}${kpis.variacaoMes}% vs mês anterior`,
      icon: TrendingUp,
      trend: (kpis.variacaoMes > 0 ? 'up' : 'down') as 'up' | 'down',
    },
    {
      title: 'Ticket Médio',
      value: `R$ ${kpis.ticketMedio.toFixed(2).replace('.', ',')}`,
      subtitle: 'Valor médio por venda',
      icon: ShoppingCart,
      trend: null as 'up' | 'down' | null,
    },
    {
      title: 'Margem Bruta',
      value: `${kpis.margemBruta}%`,
      subtitle: 'Lucro sobre vendas',
      icon: Percent,
      trend: 'up' as 'up' | 'down',
    },
  ]

  const alertCards = [
    {
      title: 'Produtos em Falta',
      value: kpis.produtosEmFalta,
      subtitle: 'Abaixo do estoque mínimo',
      icon: AlertTriangle,
      href: '/admin/estoque',
    },
    {
      title: 'Contas a Pagar',
      value: `R$ ${(kpis.contasAPagar / 1000).toFixed(1)}k`,
      subtitle: 'Vencimento em 7 dias',
      icon: CreditCard,
      href: '/admin/gastos',
    },
    {
      title: 'CMV do Mês',
      value: `R$ ${(kpis.cmvMes / 1000).toFixed(1)}k`,
      subtitle: 'Custo das mercadorias vendidas',
      icon: Package,
      href: '/admin/relatorios',
    },
  ]

  return (
    <>
      <AdminHeader title="Dashboard" subtitle="Visão geral da oficina" />

      <main className="p-4 sm:p-6 space-y-6">
        {/* Pátio da Oficina */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h2 className="font-display text-lg font-bold uppercase flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" /> Pátio da Oficina
            </h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/ordens-servico">Ver quadro completo</Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{ordensAtivas.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Veículos no pátio</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Wrench className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-status-aguardando">{aguardandoPeca}</p>
                  <p className="text-xs text-muted-foreground mt-1">Aguardando peça</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-status-aguardando/10 flex items-center justify-center">
                  <PackageSearch className="h-5 w-5 text-status-aguardando" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-status-concluido">{concluidasHoje}</p>
                  <p className="text-xs text-muted-foreground mt-1">Prontas / entregues</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-status-concluido/10 flex items-center justify-center">
                  <Clock3 className="h-5 w-5 text-status-concluido" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">R$ {valorEmAberto.toFixed(2).replace('.', ',')}</p>
                  <p className="text-xs text-muted-foreground mt-1">Valor em OS ativas</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CircleDollarSign className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {ultimasAtivas.length > 0 && (
            <Card className="mt-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Últimas ordens abertas</CardTitle>
                  <CardDescription>Veículos mais recentes em atendimento</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                {ultimasAtivas.map((ordem) => (
                  <Link
                    key={ordem.id}
                    href={`/admin/ordens-servico/${ordem.id}/editar`}
                    className="flex items-center justify-between py-2.5 px-2 -mx-2 rounded-lg border-b border-border last:border-0 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono font-bold text-sm flex-shrink-0">{ordem.placa}</span>
                      <span className="text-sm text-muted-foreground truncate">{ordem.clienteNome}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm font-medium">R$ {ordem.valorTotal.toFixed(2).replace('.', ',')}</span>
                      <Badge variant="outline">{statusLabels[ordem.status]}</Badge>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Loja & Estoque */}
        <h2 className="font-display text-lg font-bold uppercase flex items-center gap-2 pt-2">
          <Package className="h-5 w-5 text-primary" /> Loja &amp; Estoque
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((kpi, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <kpi.icon className="h-5 w-5 text-primary" />
                  </div>
                  {kpi.trend && (
                    <div className={`flex items-center gap-1 text-sm ${kpi.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                      {kpi.trend === 'up' ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{kpi.subtitle}</p>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{kpi.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Alertas */}
        <div className="grid gap-4 md:grid-cols-3">
          {alertCards.map((alert, index) => (
            <Link key={index} href={alert.href}>
              <Card className="border-l-4 border-l-destructive hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                        <alert.icon className="h-4 w-4 text-destructive" />
                      </div>
                      <div>
                        <p className="font-medium">{alert.title}</p>
                        <p className="text-xs text-muted-foreground">{alert.subtitle}</p>
                      </div>
                    </div>
                    <span className="text-xl font-bold">{alert.value}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Gráficos */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Vendas últimos 30 dias */}
          <Card>
            <CardHeader>
              <CardTitle>Vendas - Últimos 30 Dias</CardTitle>
              <CardDescription>Faturamento diário em R$</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vendasUltimosDias}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="data"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Vendas']}
                    />
                    <Line
                      type="monotone"
                      dataKey="valor"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top 10 Produtos */}
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Produtos do Mês</CardTitle>
              <CardDescription>Produtos mais vendidos em quantidade</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                {topProdutosMes.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProdutosMes} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="nome"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        width={100}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [value, 'Quantidade']}
                      />
                      <Bar
                        dataKey="quantidade"
                        fill="hsl(var(--primary))"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                    Nenhuma venda registrada este mês ainda.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Vendas por Categoria */}
          <Card>
            <CardHeader>
              <CardTitle>Vendas por Categoria</CardTitle>
              <CardDescription>Distribuição do faturamento do mês</CardDescription>
            </CardHeader>
            <CardContent>
              {vendasPorCategoria.length > 0 ? (
                <>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={vendasPorCategoria}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="valor"
                          nameKey="categoria"
                        >
                          {vendasPorCategoria.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.cor} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                          formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Vendas']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-1 gap-2 mt-4 sm:grid-cols-2">
                    {vendasPorCategoria.map((cat) => (
                      <div key={cat.categoria} className="flex items-center gap-2 text-xs min-w-0">
                        <div
                          className="h-3 w-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cat.cor }}
                        />
                        <span className="text-muted-foreground truncate">{cat.categoria}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
                  Nenhuma venda registrada este mês ainda.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Movimentações Recentes */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Movimentações Recentes</CardTitle>
                <CardDescription>Últimas entradas e saídas</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {movimentacoesRecentes.length > 0 ? (
                <div className="space-y-3">
                  {movimentacoesRecentes.map((mov) => (
                    <div
                      key={mov.id}
                      className="flex flex-wrap items-center gap-y-2 justify-between py-2 border-b border-border last:border-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`h-8 w-8 flex-shrink-0 rounded-full flex items-center justify-center ${
                          mov.tipo === 'entrada' ? 'bg-success/10' : 'bg-primary/10'
                        }`}>
                          {mov.tipo === 'entrada' ? (
                            <TrendingDown className="h-4 w-4 text-success" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{mov.descricao}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(mov.data).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-11 sm:ml-0">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {mov.quantidade} {mov.quantidade === 1 ? 'item' : 'itens'}
                          </p>
                          {mov.valor > 0 && (
                            <p className="text-xs text-muted-foreground">
                              R$ {mov.valor.toFixed(2).replace('.', ',')}
                            </p>
                          )}
                        </div>
                        <Badge variant="default">Concluído</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma movimentação registrada ainda.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Produtos Abaixo do Estoque */}
        {produtosBaixoEstoque.length > 0 && (
          <Card className="border-destructive/50">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
                  Produtos Abaixo do Estoque Mínimo
                </CardTitle>
                <CardDescription>Ação necessária para reposição</CardDescription>
              </div>
              <Button asChild size="sm" className="self-start sm:self-auto">
                <Link href="/admin/compras">Nova Entrada</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-sm font-medium text-muted-foreground">Produto</th>
                      <th className="text-left py-2 text-sm font-medium text-muted-foreground">SKU</th>
                      <th className="text-center py-2 text-sm font-medium text-muted-foreground">Estoque Atual</th>
                      <th className="text-center py-2 text-sm font-medium text-muted-foreground">Estoque Mínimo</th>
                      <th className="text-right py-2 text-sm font-medium text-muted-foreground">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtosBaixoEstoque.slice(0, 5).map((produto) => (
                      <tr key={produto.id} className="border-b border-border last:border-0">
                        <td className="py-3">
                          <p className="font-medium text-sm">{produto.nome}</p>
                          <p className="text-xs text-muted-foreground">{produto.marca}</p>
                        </td>
                        <td className="py-3 font-mono text-sm">{produto.sku}</td>
                        <td className="py-3 text-center">
                          <span className={produto.estoqueAtual < produto.estoqueMinimo ? "text-destructive font-bold" : ""}>
                            {produto.estoqueAtual}
                          </span>
                        </td>
                        <td className="py-3 text-center text-sm text-muted-foreground">
                          {produto.estoqueMinimo}
                        </td>
                        <td className="py-3 text-right">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/produtos/${produto.id}/editar`}>Repor</Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  )
}
