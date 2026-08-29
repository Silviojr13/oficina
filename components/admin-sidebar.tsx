'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Boxes,
  ShoppingCart,
  TrendingUp,
  Truck,
  FileText,
  Wrench,
  ChevronLeft,
  Wallet,
  Users,
  Plug,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'

const navGroups = [
  {
    label: 'Oficina',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/ordens-servico', label: 'Ordens de Serviço', icon: ClipboardList },
    ],
  },
  {
    label: 'Estoque & Compras',
    items: [
      { href: '/admin/produtos', label: 'Produtos', icon: Package },
      { href: '/admin/estoque', label: 'Estoque', icon: Boxes, alert: 3 },
      { href: '/admin/compras', label: 'Compras', icon: TrendingUp },
      { href: '/admin/fornecedores', label: 'Fornecedores', icon: Truck },
    ],
  },
  {
    label: 'Financeiro',
    items: [
      { href: '/admin/vendas', label: 'Vendas', icon: ShoppingCart },
      { href: '/admin/gastos', label: 'Gastos', icon: Wallet },
      { href: '/admin/relatorios', label: 'Relatórios', icon: FileText },
    ],
  },
  {
    label: 'Equipe & Sistema',
    items: [
      { href: '/admin/funcionarios', label: 'Funcionários', icon: Users },
      { href: '/admin/integracoes', label: 'Integrações', icon: Plug },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-72'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
              <Wrench className="h-4.5 w-4.5 text-sidebar-primary-foreground" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <span className="font-display block text-base font-bold uppercase leading-tight text-sidebar-foreground">
                  Oficina
                </span>
                <span className="block text-[11px] text-sidebar-foreground/55">Gestão &amp; Pátio</span>
              </div>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0 text-sidebar-foreground/60 hover:text-sidebar-foreground"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-5 overflow-y-auto p-3">
          {navGroups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="mb-1.5 px-3 font-mono text-[10px] font-medium uppercase tracking-wider text-sidebar-foreground/40">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  const Icon = item.icon

                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={cn(
                          'relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                        )}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-sidebar-primary" />
                        )}
                        <Icon className="h-[18px] w-[18px] flex-shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="flex-1 truncate">{item.label}</span>
                            {'alert' in item && item.alert && item.alert > 0 && (
                              <Badge variant="destructive" className="h-5 w-5 flex-shrink-0 rounded-full p-0 text-xs flex items-center justify-center">
                                {item.alert}
                              </Badge>
                            )}
                          </>
                        )}
                        {collapsed && 'alert' in item && item.alert && item.alert > 0 && (
                          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-2">
          <Link href="/">
            <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors">
              <ChevronLeft className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>Voltar ao Site</span>}
            </div>
          </Link>
        </div>
      </div>
    </aside>
  )
}
