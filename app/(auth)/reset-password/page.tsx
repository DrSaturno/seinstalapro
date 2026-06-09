import type { Metadata } from 'next'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Nueva contraseña - Se Instala Pro',
  description: 'Establecé tu nueva contraseña',
}

export default function ResetPasswordPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
        Nueva contraseña
      </h1>
      <p className="text-sm text-gray-600 text-center mb-6">
        Ingresá tu nueva contraseña
      </p>
      <ResetPasswordForm />
    </div>
  )
}
