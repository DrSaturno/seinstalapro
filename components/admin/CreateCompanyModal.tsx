'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import {
  createCompanySchema,
  type CreateCompanyInput,
} from '@/lib/validations/auth'
import { createCompanyAccount } from '@/lib/actions/superadmin'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'

const COUNTRIES = [
  { code: 'AR', name: 'Argentina' },
  { code: 'BR', name: 'Brasil' },
]

interface CreateCompanyModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}

export function CreateCompanyModal({
  isOpen,
  onClose,
  onCreated,
}: CreateCompanyModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCompanyInput>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: { country_code: 'AR' },
  })

  if (!isOpen) return null

  const onSubmit = async (data: CreateCompanyInput) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await createCompanyAccount(data)
      if (result.success) {
        reset()
        onCreated()
        onClose()
      } else {
        setError(result.error || 'Error al crear la empresa')
      }
    } catch {
      setError('Error inesperado. Intentá de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Crear cuenta de empresa
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          {error && (
            <Alert variant="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <p className="text-sm text-gray-500">
            La empresa queda verificada de entrada y puede empezar a usar la
            plataforma con estas credenciales.
          </p>

          <Input
            label="Nombre de la empresa"
            type="text"
            placeholder="Imprenta Ejemplo S.A."
            error={errors.company_name?.message}
            {...register('company_name')}
          />

          <Input
            label="Nombre del responsable"
            type="text"
            placeholder="Nombre y apellido"
            error={errors.full_name?.message}
            {...register('full_name')}
          />

          <Input
            label="Email de acceso"
            type="email"
            placeholder="contacto@empresa.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Contraseña inicial"
            type="password"
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />

          <div>
            <label
              htmlFor="create-company-country"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              País
            </label>
            <select
              id="create-company-country"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              {...register('country_code')}
            >
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button type="submit" fullWidth isLoading={isLoading}>
              Crear empresa
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
