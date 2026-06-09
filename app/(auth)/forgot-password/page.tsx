import type { Metadata } from 'next'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Recuperar contraseña - Se Instala Pro',
  description: 'Recuperá tu contraseña de Se Instala Pro',
}

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
        Recuperar contraseña
      </h1>
      <p className="text-sm text-gray-600 text-center mb-6">
        Te enviaremos un email para restablecer tu contraseña
      </p>
      <ForgotPasswordForm />
    </div>
  )
}
