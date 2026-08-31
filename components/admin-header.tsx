'use client'

import Link from 'next/link'
import { Bell, Search, User, Menu, Plus, LogOut } from 'lucide-react'
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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { AdminSidebar } from './admin-sidebar'

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

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card px-6">
      {/* Mobile menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
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
        <Button asChild size="sm" className="hidden sm:inline-flex">
          <Link href="/admin/ordens-servico/nova">
            <Plus className="h-4 w-4 mr-1.5" /> Nova OS
          </Link>
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notificações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1">
              <span className="font-medium">Estoque baixo</span>
              <span className="text-xs text-muted-foreground">3 produtos abaixo do mínimo</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1">
              <span className="font-medium">Nova venda</span>
              <span className="text-xs text-muted-foreground">Pedido #1255 realizado</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1">
              <span className="font-medium">Conta a vencer</span>
              <span className="text-xs text-muted-foreground">NF Bosch vence em 3 dias</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
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
            <DropdownMenuItem className="text-destructive" onClick={() => signOut({ redirectTo: '/' })}>
              <LogOut className="h-4 w-4 mr-2" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
