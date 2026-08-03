import { AdminSidebar } from '@/components/admin-sidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>
      
      {/* Main content */}
      <div className="lg:pl-64">
        {children}
      </div>
    </div>
  )
}
