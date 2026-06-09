'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  companyProfileSchema,
  type CompanyProfileInput,
} from '@/lib/validations/company'
import { getCompanyProfile, updateCompanyProfile } from '@/lib/actions/company'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { COMPANY_STATUS } from '@/lib/utils/status'
import type { Company, CompanyStatus } from '@/types/database'
import { clsx } from 'clsx'

const COUNTRIES = [
  { code: 'AR', name: 'Argentina' },
  { code: 'BR', name: 'Brasil' },
]

export function CompanyProfileForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [company, setCompany] = useState<Company | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CompanyProfileInput>({
    resolver: zodResolver(companyProfileSchema),
  })

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getCompanyProfile()
        if (data) {
          setCompany(data)
          reset({
            company_name: data.company_name,
            tax_id: data.tax_id || '',
            website: data.website || '',
            description: data.description || '',
            country: data.country,
            city: data.city || '',
            address: data.address || '',
          })
        }
      } catch (err) {
        setError('Error al cargar el perfil')
      } finally {
        setLoadingProfile(false)
      }
    }
    loadProfile()
  }, [reset])

  const onSubmit = async (data: CompanyProfileInput) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await updateCompanyProfile(data)
      if (result.success) {
        setSuccess(result.message || 'Perfil actualizado')
      } else {
        setError(result.error || 'Error al actualizar')
      }
    } catch (err) {
      setError('Error inesperado. Intentá de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner border-primary-500" />
      </div>
    )
  }

  const statusConfig = company?.status
    ? COMPANY_STATUS[company.status as CompanyStatus]
    : null

  return (
    <div>
      {/* Status de la empresa */}
      {statusConfig && (
        <div className="mb-6 flex items-center gap-2">
          <span className="text-sm text-gray-600">Estado:</span>
          <span
            className={clsx(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              statusConfig.bgColor,
              statusConfig.color
            )}
          >
            {statusConfig.label}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <Input
          label="Nombre de la empresa *"
          placeholder="Razón social o nombre comercial"
          error={errors.company_name?.message}
          {...register('company_name')}
        />

        <Input
          label="CUIT / CNPJ"
          placeholder="30-12345678-9"
          helperText="Identificación fiscal (opcional)"
          error={errors.tax_id?.message}
          {...register('tax_id')}
        />

        <Input
          label="Sitio web"
          type="url"
          placeholder="https://tuempresa.com"
          error={errors.website?.message}
          {...register('website')}
        />

        {/* Descripción */}
        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Descripción
          </label>
          <textarea
            id="description"
            rows={4}
            placeholder="Contanos sobre tu empresa, qué tipo de trabajos realizás..."
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
              errors.description
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-primary-500'
            }`}
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* País */}
        <div className="mb-4">
          <label
            htmlFor="country"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            País *
          </label>
          <select
            id="country"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            {...register('country')}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Ciudad"
            placeholder="Buenos Aires"
            error={errors.city?.message}
            {...register('city')}
          />
          <Input
            label="Dirección"
            placeholder="Av. Corrientes 1234"
            error={errors.address?.message}
            {...register('address')}
          />
        </div>

        <div className="pt-4 border-t border-gray-200">
          <Button
            type="submit"
            isLoading={isLoading}
            disabled={!isDirty}
          >
            Guardar cambios
          </Button>
        </div>
      </form>
    </div>
  )
}
