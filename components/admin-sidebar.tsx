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
  PanelLeftClose,
  PanelLeftOpen,
  Wallet,
  Users,
  Plug,
  Sun,
  Moon,
  UserCog,
  MessageSquare,
  Contact,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { useAdminUI } from '@/components/admin-theme-provider'

const navGroups = [
  {
    label: 'Oficina',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/ordens-servico', label: 'Ordens de Serviço', icon: ClipboardList },
      { href: '/admin/clientes', label: 'Clientes', icon: Contact },
      { href: '/admin/mensagens', label: 'Mensagens', icon: MessageSquare },
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
      { href: '/admin/gastos', label: 'Gastos', icon: Wallet, adminOnly: true },
      { href: '/admin/relatorios', label: 'Relatórios', icon: FileText, adminOnly: true },
    ],
  },
  {
    label: 'Equipe & Sistema',
    items: [
      { href: '/admin/funcionarios', label: 'Funcionários', icon: Users, adminOnly: true },
      { href: '/admin/usuarios', label: 'Usuários', icon: UserCog, adminOnly: true },
      { href: '/admin/integracoes', label: 'Integrações', icon: Plug, adminOnly: true },
    ],
  },
]

export function AdminSidebar({ forceExpanded = false }: { forceExpanded?: boolean }) {
  const pathname = usePathname()
  const { theme, toggleTheme, collapsed: sharedCollapsed, setCollapsed } = useAdminUI()
  const collapsed = forceExpanded ? false : sharedCollapsed
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'admin'

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-72'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div
          className={cn(
            'flex h-16 items-center border-b border-sidebar-border',
            collapsed ? 'justify-center px-2' : 'gap-2.5 px-4'
          )}
        >
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
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-5 overflow-y-auto p-3">
          {navGroups.map((group) => {
            const items = group.items.filter((item) => !('adminOnly' in item && item.adminOnly) || isAdmin)
            if (items.length === 0) return null

            return (
            <div key={group.label}>
              {!collapsed && (
                <p className="mb-1.5 px-3 font-mono text-[10px] font-medium uppercase tracking-wider text-sidebar-foreground/40">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {items.map((item) => {
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
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-2 space-y-0.5">
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Usar tema claro' : 'Usar tema escuro'}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/50 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 flex-shrink-0" /> : <Moon className="h-4 w-4 flex-shrink-0" />}
            {!collapsed && <span>{theme === 'dark' ? 'Tema claro' : 'Tema escuro'}</span>}
          </button>

          {!forceExpanded && (
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? 'Expandir menu' : 'Recolher menu'}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/50 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
            >
              {collapsed ? (
                <PanelLeftOpen className="h-4 w-4 flex-shrink-0" />
              ) : (
                <PanelLeftClose className="h-4 w-4 flex-shrink-0" />
              )}
              {!collapsed && <span>Recolher menu</span>}
            </button>
          )}

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
