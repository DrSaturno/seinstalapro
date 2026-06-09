'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { createJobSchema, type CreateJobInput } from '@/lib/validations/job'
import { createJob, getCategories, getLocations } from '@/lib/actions/jobs'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import type { Category, Location } from '@/types/database'

const CURRENCIES = [
  { code: 'ARS', label: 'Pesos Argentinos (ARS)' },
  { code: 'BRL', label: 'Reais (BRL)' },
  { code: 'USD', label: 'Dólares (USD)' },
]

export function JobForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateJobInput>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      currency: 'ARS',
    },
  })

  // Cargar categorías y ubicaciones
  useEffect(() => {
    async function loadData() {
      try {
        const [cats, locs] = await Promise.all([
          getCategories(),
          getLocations(),
        ])
        setCategories(cats)
        setLocations(locs)
      } catch (err) {
        console.error('Error cargando datos:', err)
      } finally {
        setLoadingData(false)
      }
    }
    loadData()
  }, [])

  const onSubmit = async (data: CreateJobInput) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await createJob(data)
      if (result.success && result.jobId) {
        router.push(`/empresa/trabajos/${result.jobId}`)
      } else {
        setError(result.error || 'Error al crear el trabajo')
      }
    } catch (err) {
      setError('Error inesperado. Intentá de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  // Agrupar ubicaciones por país
  const locationsByCountry = locations.reduce<Record<string, Location[]>>(
    (acc, loc) => {
      const key = loc.country_name
      if (!acc[key]) acc[key] = []
      acc[key].push(loc)
      return acc
    },
    {}
  )

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner border-primary-500" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Título */}
      <Input
        label="Título del trabajo *"
        placeholder="Ej: Instalación de vinilos en local comercial"
        error={errors.title?.message}
        {...register('title')}
      />

      {/* Descripción */}
      <div className="mb-4">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Descripción *
        </label>
        <textarea
          id="description"
          rows={5}
          placeholder="Describí el trabajo de instalación, medidas, materiales, ubicación exacta, accesos, horarios disponibles..."
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
            errors.description
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-primary-500'
          }`}
          {...register('description')}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Categoría */}
      <div className="mb-4">
        <label
          htmlFor="category_id"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Categoría *
        </label>
        <select
          id="category_id"
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
            errors.category_id
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-primary-500'
          }`}
          {...register('category_id')}
        >
          <option value="">Seleccioná una categoría</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
              {cat.description ? ` - ${cat.description}` : ''}
            </option>
          ))}
        </select>
        {errors.category_id && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.category_id.message}
          </p>
        )}
      </div>

      {/* Ubicación */}
      <div className="mb-4">
        <label
          htmlFor="location_id"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Ubicación
        </label>
        <select
          id="location_id"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          {...register('location_id')}
        >
          <option value="">Sin especificar</option>
          {Object.entries(locationsByCountry).map(([country, locs]) => (
            <optgroup key={country} label={country}>
              {locs.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.province_name
                    ? `${loc.city_name}, ${loc.province_name}`
                    : loc.city_name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Presupuesto */}
      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">
          Presupuesto estimado
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Input
              label="Mínimo"
              type="number"
              placeholder="0"
              error={errors.budget_min?.message}
              {...register('budget_min', { valueAsNumber: true })}
            />
          </div>
          <div>
            <Input
              label="Máximo"
              type="number"
              placeholder="0"
              error={errors.budget_max?.message}
              {...register('budget_max', { valueAsNumber: true })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Moneda
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              {...register('currency')}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Fechas */}
      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">
          Fechas estimadas
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Fecha inicio"
            type="date"
            error={errors.start_date?.message}
            {...register('start_date')}
          />
          <Input
            label="Fecha fin"
            type="date"
            error={errors.end_date?.message}
            {...register('end_date')}
          />
        </div>
      </div>

      {/* Botones */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        <Button type="submit" isLoading={isLoading} size="lg">
          Crear borrador
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
      </div>

      <p className="text-xs text-gray-500">
        * El trabajo se creará como borrador. Después podrás agregar imágenes y enviarlo a revisión.
      </p>
    </form>
  )
}
