import { AdminSidebar } from '@/components/admin-sidebar'
import { AdminThemeProvider } from '@/components/admin-theme-provider'
import { AdminContentArea } from '@/components/admin-content-area'
import { AuthSessionProvider } from '@/components/session-provider'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthSessionProvider>
      <AdminThemeProvider>
        {/* Sidebar - Desktop */}
        <div className="hidden lg:block">
          <AdminSidebar />
        </div>

        {/* Main content */}
        <AdminContentArea>{children}</AdminContentArea>
      </AdminThemeProvider>
    </AuthSessionProvider>
  )
}
