'use client';

import { useAdminUI } from '@/components/admin-theme-provider';
import { cn } from '@/lib/utils';

export function AdminContentArea({ children }: { children: React.ReactNode }) {
  const { collapsed } = useAdminUI();

  return (
    <div className={cn('transition-[padding] duration-300', collapsed ? 'lg:pl-16' : 'lg:pl-72')}>
      {children}
    </div>
  );
}
