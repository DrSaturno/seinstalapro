'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from '@/lib/validations/auth'
import { forgotPassword } from '@/lib/auth/actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { ArrowLeft } from 'lucide-react'

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await forgotPassword(data)
      if (result.success) {
        setSuccess(result.message || 'Email enviado')
      } else {
        setError(result.error || 'Error al enviar el email')
      }
    } catch (err) {
      setError('Error inesperado. Intentá de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Link
        href="/login"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-primary-500 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al login
      </Link>

      {success ? (
        <Alert variant="success">
          {success}
        </Alert>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <p className="text-sm text-gray-600">
            Ingresá tu email y te enviaremos un link para restablecer tu contraseña.
          </p>

          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={isLoading}
          >
            Enviar instrucciones
          </Button>
        </form>
      )}
    </div>
  )
}
