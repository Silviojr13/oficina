'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'oficina-theme';
const SIDEBAR_STORAGE_KEY = 'oficina-sidebar-collapsed';

type AdminUIContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
};

const AdminUIContext = createContext<AdminUIContextValue | null>(null);

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [collapsed, setCollapsedState] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (storedTheme === 'dark' || storedTheme === 'light') {
        setTheme(storedTheme);
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
      }

      const storedCollapsed = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (storedCollapsed === 'true') setCollapsedState(true);
    } catch {
      // localStorage indisponível (ex: navegação privada) - mantém os padrões
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignora falha ao persistir preferência
    }
  }, [theme, mounted]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const setCollapsed = (value: boolean) => {
    setCollapsedState(value);
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(value));
    } catch {
      // ignora falha ao persistir preferência
    }
  };

  return (
    <AdminUIContext.Provider value={{ theme, toggleTheme, collapsed, setCollapsed }}>
      <div
        suppressHydrationWarning
        className={`theme-oficina ${mounted && theme === 'dark' ? 'dark' : ''} min-h-screen bg-background text-foreground`}
      >
        {children}
      </div>
    </AdminUIContext.Provider>
  );
}

export function useAdminUI() {
  const ctx = useContext(AdminUIContext);
  if (!ctx) throw new Error('useAdminUI deve ser usado dentro de AdminThemeProvider');
  return ctx;
}
