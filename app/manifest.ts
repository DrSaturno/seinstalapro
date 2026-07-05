import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Se Instala Pro',
    short_name: 'SeInstalaPro',
    description:
      'Software de gestión de instalaciones gráficas: equipo, asignación y seguimiento',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2e75b6',
    orientation: 'portrait',
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
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
