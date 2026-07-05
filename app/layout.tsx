import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/providers/AuthProvider'
import { PwaRegister } from '@/components/shared/PwaRegister'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] })

export const metadata: Metadata = {
  title: 'Se Instala Pro - Software de Gestión de Instalaciones Gráficas',
  description: 'El software para empresas del sector gráfico: armá tu equipo de instaladores, asigná trabajos y hacé seguimiento de cada instalación',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  keywords: ['instalaciones', 'gráficas', 'vinilos', 'señalética', 'software de gestión', 'saas'],
  openGraph: {
    title: 'Se Instala Pro',
    description: 'Software de gestión de instalaciones gráficas para empresas del sector',
    type: 'website',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Se Instala Pro',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2e75b6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={jakarta.className}>
        <PwaRegister />
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              duration: 4000,
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
