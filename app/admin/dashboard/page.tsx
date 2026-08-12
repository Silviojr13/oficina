'use client'

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
  ArrowDownRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AdminHeader } from '@/components/admin-header'
import { 
  dashboardKPIs, 
  movimentacoesRecentes, 
  vendasUltimos30Dias, 
  topProdutosMes, 
  vendasPorCategoria,
  produtos 
} from '@/lib/mock-data'
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

const kpiCards = [
  {
    title: 'Vendas Hoje',
    value: `R$ ${dashboardKPIs.vendasHoje.toFixed(2).replace('.', ',')}`,
    subtitle: `${dashboardKPIs.pedidosHoje} pedidos`,
    icon: DollarSign,
    trend: null
  },
  {
    title: 'Vendas do Mês',
    value: `R$ ${(dashboardKPIs.vendasMes / 1000).toFixed(1)}k`,
    subtitle: `${dashboardKPIs.variacaoMes > 0 ? '+' : ''}${dashboardKPIs.variacaoMes}% vs mês anterior`,
    icon: TrendingUp,
    trend: dashboardKPIs.variacaoMes > 0 ? 'up' : 'down'
  },
  {
    title: 'Ticket Médio',
    value: `R$ ${dashboardKPIs.ticketMedio.toFixed(2).replace('.', ',')}`,
    subtitle: 'Valor médio por venda',
    icon: ShoppingCart,
    trend: null
  },
  {
    title: 'Margem Bruta',
    value: `${dashboardKPIs.margemBruta}%`,
    subtitle: 'Lucro sobre vendas',
    icon: Percent,
    trend: 'up'
  }
]

const alertCards = [
  {
    title: 'Produtos em Falta',
    value: dashboardKPIs.produtosEmFalta,
    subtitle: 'Abaixo do estoque mínimo',
    icon: AlertTriangle,
    color: 'destructive',
    href: '/admin/estoque'
  },
  {
    title: 'Contas a Pagar',
    value: `R$ ${(dashboardKPIs.contasAPagar / 1000).toFixed(1)}k`,
    subtitle: 'Vencimento em 7 dias',
    icon: CreditCard,
    color: 'warning',
    href: '/admin/compras'
  },
  {
    title: 'CMV do Mês',
    value: `R$ ${(dashboardKPIs.cmvMes / 1000).toFixed(1)}k`,
    subtitle: 'Custo das mercadorias',
    icon: Package,
    color: 'info',
    href: '/admin/relatorios'
  }
]

const COLORS = ['#F97316', '#22C55E', '#3B82F6', '#EAB308', '#8B5CF6', '#6B7280']

export default function DashboardPage() {
  // Produtos abaixo do estoque mínimo
  const produtosBaixoEstoque = produtos.filter(p => p.estoqueAtual <= p.estoqueMinimo && p.estoqueAtual > 0)

  return (
    <>
      <AdminHeader title="Dashboard" subtitle="Visão geral do sistema" />
      
      <main className="p-6 space-y-6">
        {/* KPIs Principais */}
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
            <Card key={index} className="border-l-4 border-l-destructive">
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
                  <LineChart data={vendasUltimos30Dias}>
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
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Vendas por Categoria */}
          <Card>
            <CardHeader>
              <CardTitle>Vendas por Categoria</CardTitle>
              <CardDescription>Distribuição do faturamento</CardDescription>
            </CardHeader>
            <CardContent>
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
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
              <div className="grid grid-cols-2 gap-2 mt-4">
                {vendasPorCategoria.map((cat, index) => (
                  <div key={cat.categoria} className="flex items-center gap-2 text-xs">
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                    />
                    <span className="text-muted-foreground">{cat.categoria}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Movimentações Recentes */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Movimentações Recentes</CardTitle>
                <CardDescription>Últimas entradas e saídas</CardDescription>
              </div>
              <Button variant="outline" size="sm">Ver todas</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {movimentacoesRecentes.slice(0, 8).map((mov) => (
                  <div 
                    key={mov.id} 
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        mov.tipo === 'entrada' ? 'bg-success/10' : 'bg-primary/10'
                      }`}>
                        {mov.tipo === 'entrada' ? (
                          <TrendingDown className="h-4 w-4 text-success" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{mov.descricao}</p>
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
                    <Badge 
                      variant={mov.status === 'concluido' ? 'default' : mov.status === 'pendente' ? 'secondary' : 'destructive'}
                      className="ml-4"
                    >
                      {mov.status === 'concluido' ? 'Concluído' : mov.status === 'pendente' ? 'Pendente' : 'Cancelado'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Produtos Abaixo do Estoque */}
        {produtosBaixoEstoque.length > 0 && (
          <Card className="border-destructive/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Produtos Abaixo do Estoque Mínimo
                </CardTitle>
                <CardDescription>Ação necessária para reposição</CardDescription>
              </div>
              <Button size="sm">Gerar Pedido de Compra</Button>
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
                          <Button variant="outline" size="sm">
                            Repor
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
