import type { Metadata } from 'next'
import { SignupForm } from '@/components/auth/SignupForm'

export const metadata: Metadata = {
  title: 'Crear cuenta - Se Instala Pro',
  description: 'Registrate en Se Instala Pro como empresa o instalador profesional',
}

export default function SignupPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
        Crear cuenta
      </h1>
      <p className="text-sm text-gray-600 text-center mb-6">
        Unite al marketplace de instalaciones gráficas
      </p>
      <SignupForm />
    </div>
  )
}
