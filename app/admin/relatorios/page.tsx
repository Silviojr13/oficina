'use client'

import { AdminHeader } from '@/components/admin-header'
import { Card, CardContent } from '@/components/ui/card'
import { Construction } from 'lucide-react'

export default function RelatoriosPage() {
  return (
    <div>
      <AdminHeader title="Relatórios" subtitle="Relatórios financeiros e operacionais" />
      <main className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Construction className="h-10 w-10 text-muted-foreground" />
            <p className="text-lg font-medium">Em construção</p>
            <p className="text-sm text-muted-foreground max-w-md">
              Esta funcionalidade ainda está sendo desenvolvida e estará disponível em breve.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}