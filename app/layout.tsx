import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Se Instala Pro - Marketplace de Instalaciones Gráficas',
  description: 'Plataforma para conectar empresas con instaladores profesionales de servicios gráficos',
  keywords: ['instalaciones', 'gráficas', 'vinilos', 'señalética', 'marketplace'],
  openGraph: {
    title: 'Se Instala Pro',
    description: 'Marketplace especializado en instalaciones gráficas',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
