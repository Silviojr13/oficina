import type { MetadataRoute } from 'next'

// App instalavel (PWA): no celular, "Adicionar a tela inicial" / "Instalar app"
// cria um icone que abre o sistema em tela cheia, sem a barra do navegador.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'AutoPeças Pro',
    short_name: 'AutoPeças',
    description: 'Peças e acessórios automotivos — loja e gestão da oficina',
    lang: 'pt-BR',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    orientation: 'portrait',
    categories: ['business', 'productivity', 'shopping'],
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    // Atalhos ao segurar o icone do app na tela inicial (Android).
    shortcuts: [
      {
        name: 'Scanner de código de barras',
        short_name: 'Scanner',
        url: '/admin/scanner',
        icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Nova ordem de serviço',
        short_name: 'Nova OS',
        url: '/admin/ordens-servico/nova',
        icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Pátio (ordens de serviço)',
        short_name: 'Pátio',
        url: '/admin/ordens-servico',
        icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
    ],
  }
}
