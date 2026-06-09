import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Iniciar sesión - Se Instala Pro',
  description: 'Iniciá sesión en tu cuenta de Se Instala Pro',
}

export default function LoginPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
        Iniciar sesión
      </h1>
      <p className="text-sm text-gray-600 text-center mb-6">
        Ingresá a tu cuenta para gestionar tus instalaciones
      </p>
      <LoginForm />
    </div>
  )
}
