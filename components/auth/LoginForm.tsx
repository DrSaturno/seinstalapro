'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import type { UserRole } from '@/types/database'

// Mapeo de roles a rutas de dashboard
const ROLE_DASHBOARD: Record<UserRole, string> = {
  company: '/empresa/dashboard',
  installer: '/instalador/dashboard',
  admin: '/admin/dashboard',
  superadmin: '/admin/dashboard',
}

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
      const supabase = createClient()

      // Sign in en el CLIENTE (para que onAuthStateChange sincronice la sesión)
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        if (authError.message === 'Invalid login credentials') {
          setError('Email o contraseña incorrectos')
        } else if (authError.message === 'Email not confirmed') {
          setError('Confirmá tu email antes de iniciar sesión. Revisá tu casilla de correo.')
        } else if (authError.message.includes('rate limit') || authError.message.includes('too many')) {
          setError('Demasiados intentos. Esperá unos minutos.')
        } else {
          setError('Error al iniciar sesión. Intentá de nuevo.')
        }
        return
      }

      // Obtener usuario y perfil para determinar rol
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Error al obtener datos del usuario')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', user.id)
        .single()

      if (!profile) {
        setError('No se encontró tu perfil. Contactá a soporte.')
        return
      }

      if (profile.status === 'suspended') {
        await supabase.auth.signOut()
        setError('Tu cuenta está suspendida. Contactá a soporte.')
        return
      }

      // Navegar con recarga completa para sincronizar server + client
      const dashboardUrl = ROLE_DASHBOARD[profile.role as UserRole]
      window.location.href = dashboardUrl
    } catch (err) {
      setError('Error inesperado. Intentá de nuevo.')
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
