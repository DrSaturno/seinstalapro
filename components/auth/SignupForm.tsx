'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { signupSchema, type SignupInput } from '@/lib/validations/auth'
import { signup } from '@/lib/auth/actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { Building2, Wrench } from 'lucide-react'

const COUNTRIES = [
  { code: 'AR', name: 'Argentina' },
  { code: 'BR', name: 'Brasil' },
]

export function SignupForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      country_code: 'AR',
      role: undefined,
    },
  })

  const selectedRole = watch('role')

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await signup(data)
      if (result.success) {
        setSuccess(result.message || 'Cuenta creada exitosamente')
      } else {
        setError(result.error || 'Error al crear la cuenta')
      }
    } catch (err) {
      setError('Error inesperado. Intentá de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <Alert variant="success">
          {success}
        </Alert>
        <p className="text-gray-600 text-sm">
          Revisá tu casilla de correo (incluyendo spam) y hacé click en el link de confirmación.
        </p>
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

      {/* Selector de Rol */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          ¿Qué tipo de cuenta necesitás?
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setValue('role', 'company', { shouldValidate: true })}
            className={`flex flex-col items-center gap-2.5 p-5 rounded-2xl border-2 transition-all duration-200 active:scale-95 ${
              selectedRole === 'company'
                ? 'border-primary-500 bg-primary-50/70 text-primary-700 shadow-sm shadow-primary-500/5'
                : 'border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-slate-50 text-slate-500'
            }`}
          >
            <Building2
              className={`h-8 w-8 transition-colors ${
                selectedRole === 'company' ? 'text-primary-600' : 'text-slate-400'
              }`}
            />
            <span className="font-bold text-sm">Empresa</span>
            <span className="text-[11px] text-center leading-normal text-slate-400">
              Publicá trabajos de instalación
            </span>
          </button>

          <button
            type="button"
            onClick={() => setValue('role', 'installer', { shouldValidate: true })}
            className={`flex flex-col items-center gap-2.5 p-5 rounded-2xl border-2 transition-all duration-200 active:scale-95 ${
              selectedRole === 'installer'
                ? 'border-primary-500 bg-primary-50/70 text-primary-700 shadow-sm shadow-primary-500/5'
                : 'border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-slate-50 text-slate-500'
            }`}
          >
            <Wrench
              className={`h-8 w-8 transition-colors ${
                selectedRole === 'installer' ? 'text-primary-600' : 'text-slate-400'
              }`}
            />
            <span className="font-bold text-sm">Instalador</span>
            <span className="text-[11px] text-center leading-normal text-slate-400">
              Ofrecé tus servicios
            </span>
          </button>
        </div>
        {errors.role && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.role.message}
          </p>
        )}
      </div>

      <Input
        label="Nombre completo"
        type="text"
        placeholder="Tu nombre o razón social"
        autoComplete="name"
        error={errors.full_name?.message}
        {...register('full_name')}
      />

      <Input
        label="Email"
        type="email"
        placeholder="tu@email.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      {/* País */}
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

      <Button
        type="submit"
        fullWidth
        size="lg"
        isLoading={isLoading}
      >
        Crear cuenta
      </Button>

      <p className="text-center text-sm text-gray-600">
        ¿Ya tenés cuenta?{' '}
        <Link
          href="/login"
          className="text-primary-500 font-medium hover:text-primary-600 hover:underline"
        >
          Iniciá sesión
        </Link>
      </p>
    </form>
  )
}
