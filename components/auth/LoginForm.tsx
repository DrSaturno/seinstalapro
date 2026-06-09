'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { login } from '@/lib/auth/actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await login(data)
      if (!result.success && result.error) {
        setError(result.error)
      }
      // Si es exitoso, el server action hace redirect
    } catch (err) {
      // redirect() lanza un error NEXT_REDIRECT - es comportamiento normal
      // Solo mostrar error si no es un redirect
      if (err instanceof Error && err.message !== 'NEXT_REDIRECT') {
        setError('Error inesperado. Intentá de nuevo.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Input
        label="Email"
        type="email"
        placeholder="tu@email.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Contraseña"
        type="password"
        placeholder="Tu contraseña"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />

      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-sm text-primary-500 hover:text-primary-600 hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <Button
        type="submit"
        fullWidth
        size="lg"
        isLoading={isLoading}
      >
        Iniciar sesión
      </Button>

      <p className="text-center text-sm text-gray-600">
        ¿No tenés cuenta?{' '}
        <Link
          href="/signup"
          className="text-primary-500 font-medium hover:text-primary-600 hover:underline"
        >
          Registrate gratis
        </Link>
      </p>
    </form>
  )
}
