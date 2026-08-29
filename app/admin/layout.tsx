import { AdminSidebar } from '@/components/admin-sidebar'
import { AdminThemeProvider } from '@/components/admin-theme-provider'
import { AdminContentArea } from '@/components/admin-content-area'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminThemeProvider>
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Main content */}
      <AdminContentArea>{children}</AdminContentArea>
    </AdminThemeProvider>
  )
}
