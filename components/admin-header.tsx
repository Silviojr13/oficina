'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell, Search, User, Menu, Plus, LogOut, ScanBarcode, Sun, Moon } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { getAlertasPainel } from '@/lib/actions/alertas'
import { AdminSidebar } from './admin-sidebar'
import { useAdminUI } from './admin-theme-provider'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  funcionario: 'Funcionário',
  cliente: 'Cliente',
}

interface AdminHeaderProps {
  title: string
  subtitle?: string
}

export function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const { data: session } = useSession()
  const user = session?.user
  const { theme, toggleTheme } = useAdminUI()

  // Avisos reais do sino (antes eram 3 textos fixos no codigo).
  const [alertas, setAlertas] = useState({ mensagensNaoLidas: 0, estoqueBaixo: 0, aguardandoPeca: 0 })
  useEffect(() => {
    getAlertasPainel().then(setAlertas)
  }, [])
  const avisos = [
    { quantidade: alertas.mensagensNaoLidas, titulo: 'Mensagens do site', texto: 'não lida(s)', href: '/admin/mensagens' },
    { quantidade: alertas.estoqueBaixo, titulo: 'Estoque baixo', texto: 'produto(s) no mínimo ou zerados', href: '/admin/estoque?aba=baixo' },
    { quantidade: alertas.aguardandoPeca, titulo: 'Aguardando peça', texto: 'OS parada(s) esperando peça', href: '/admin/ordens-servico' },
  ].filter((a) => a.quantidade > 0)
  const totalAvisos = avisos.reduce((soma, a) => soma + a.quantidade, 0)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card px-6">
      {/* Mobile menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          <SheetTitle className="sr-only">Menu do painel</SheetTitle>
          <AdminSidebar forceExpanded />
        </SheetContent>
      </Sheet>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="font-display text-xl font-bold uppercase leading-tight truncate">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground truncate">{subtitle}</p>}
      </div>

      {/* Search */}
      <div className="hidden md:block w-64">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar placa, cliente, produto..."
            className="pl-10 bg-muted border-transparent"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon" title="Scanner">
          <Link href="/admin/scanner" aria-label="Abrir scanner de código de barras">
            <ScanBarcode className="h-5 w-5" />
          </Link>
        </Button>

        <Button asChild size="sm" className="hidden sm:inline-flex">
          <Link href="/admin/ordens-servico/nova">
            <Plus className="h-4 w-4 mr-1.5" /> Nova OS
          </Link>
        </Button>

        {/* Avisos */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label={totalAvisos ? `${totalAvisos} avisos` : 'Avisos'}>
              <Bell className="h-5 w-5" />
              {totalAvisos > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1 text-xs flex items-center justify-center tabular-nums">
                  {totalAvisos > 99 ? '99+' : totalAvisos}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Avisos</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {avisos.length === 0 ? (
              <p className="px-2 py-3 text-sm text-muted-foreground">Nada pendente por aqui.</p>
            ) : (
              avisos.map((aviso) => (
                <DropdownMenuItem key={aviso.href} asChild>
                  <Link href={aviso.href} className="flex flex-col items-start gap-0.5">
                    <span className="font-medium">{aviso.titulo}</span>
                    <span className="text-xs text-muted-foreground">{aviso.quantidade} {aviso.texto}</span>
                  </Link>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Minha conta">
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt={user.name ?? ''} className="h-8 w-8 rounded-full" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span className="truncate">{user?.name ?? user?.email ?? 'Minha Conta'}</span>
              {user?.role && (
                <span className="text-xs font-normal text-muted-foreground">
                  {ROLE_LABELS[user.role] ?? user.role}
                </span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* Preferencia de cada usuario - fica aqui, e nao no menu lateral. */}
            <DropdownMenuItem onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
              {theme === 'dark' ? 'Usar tema claro' : 'Usar tema escuro'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => signOut({ redirectTo: '/' })}>
              <LogOut className="h-4 w-4 mr-2" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
