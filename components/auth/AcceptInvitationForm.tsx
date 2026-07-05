'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  acceptInvitationSchema,
  type AcceptInvitationInput,
} from '@/lib/validations/auth'
import {
  acceptInvitationExisting,
  acceptInvitationNew,
} from '@/lib/actions/team'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'

const COUNTRIES = [
  { code: 'AR', name: 'Argentina' },
  { code: 'BR', name: 'Brasil' },
]

interface AcceptInvitationFormProps {
  token: string
  email: string
  companyName: string
  // 'new_account' = crear cuenta; 'existing_login' = debe loguearse antes;
  // 'existing_ready' = logueado con la cuenta invitada, acepta con un click
  mode: 'new_account' | 'existing_login' | 'existing_ready'
}

export function AcceptInvitationForm({
  token,
  email,
  companyName,
  mode,
}: AcceptInvitationFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInvitationInput>({
    resolver: zodResolver(acceptInvitationSchema),
    defaultValues: { country_code: 'AR' },
  })

  // --- Caso: ya tiene cuenta pero no está logueado con ella ---
  if (mode === 'existing_login') {
    return (
      <div className="space-y-4">
        <Alert variant="info">
          Ya existe una cuenta de instalador con el email{' '}
          <span className="font-semibold">{email}</span>. Iniciá sesión con esa
          cuenta y volvé a abrir este link para aceptar la invitación.
        </Alert>
        <Link href={`/login?redirectTo=/invitaciones/${token}`}>
          <Button fullWidth size="lg">
            Iniciar sesión para aceptar
          </Button>
        </Link>
      </div>
    )
  }

  // --- Caso: logueado con la cuenta invitada, aceptar directo ---
  if (mode === 'existing_ready') {
    const handleAccept = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await acceptInvitationExisting(token)
        if (result.success) {
          setSuccess(result.message || 'Invitación aceptada')
          setTimeout(() => router.push('/instalador/dashboard'), 1500)
        } else {
          setError(result.error || 'Error al aceptar la invitación')
        }
      } catch {
        setError('Error inesperado. Intentá de nuevo.')
      } finally {
        setIsLoading(false)
      }
    }

    return (
      <div className="space-y-4">
        {error && (
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success ? (
          <Alert variant="success">{success}</Alert>
        ) : (
          <>
            <p className="text-sm text-gray-600 text-center">
              Estás logueado como <span className="font-semibold">{email}</span>.
              Al aceptar, vas a formar parte del equipo de {companyName}.
            </p>
            <Button fullWidth size="lg" isLoading={isLoading} onClick={handleAccept}>
              Aceptar invitación
            </Button>
          </>
        )}
      </div>
    )
  }

  // --- Caso: cuenta nueva (mini-signup atado a la invitación) ---
  const onSubmit = async (data: AcceptInvitationInput) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await acceptInvitationNew(token, data)
      if (result.success) {
        setSuccess(result.message || 'Cuenta creada')
      } else {
        setError(result.error || 'Error al crear la cuenta')
      }
    } catch {
      setError('Error inesperado. Intentá de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <Alert variant="success">{success}</Alert>
        <Link
          href="/login"
          className="inline-block text-primary-500 font-medium hover:underline"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    )
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
        value={email}
        disabled
        readOnly
      />

      <Input
        label="Nombre completo"
        type="text"
        placeholder="Tu nombre y apellido"
        autoComplete="name"
        error={errors.full_name?.message}
        {...register('full_name')}
      />

      <div className="mb-4">
        <label
          htmlFor="country_code"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          País
        </label>
        <select
          id="country_code"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          {...register('country_code')}
        >
          {COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
        {errors.country_code && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.country_code.message}
          </p>
        )}
      </div>

      <Input
        label="Contraseña"
        type="password"
        placeholder="Mínimo 6 caracteres"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />

      <Input
        label="Confirmar contraseña"
        type="password"
        placeholder="Repetí tu contraseña"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
        Crear cuenta y sumarme al equipo
      </Button>
    </form>
  )
}
