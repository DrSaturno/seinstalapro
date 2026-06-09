'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import {
  createOfferSchema,
  type CreateOfferInput,
} from '@/lib/validations/installer'
import { createOffer } from '@/lib/actions/offers'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Send } from 'lucide-react'

interface OfferFormProps {
  jobId: string
  jobTitle: string
  budgetMin?: number
  budgetMax?: number
  currency?: string
}

export function OfferForm({
  jobId,
  jobTitle,
  budgetMin,
  budgetMax,
  currency = 'ARS',
}: OfferFormProps) {
  const router = useRouter()
  const [result, setResult] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateOfferInput>({
    resolver: zodResolver(createOfferSchema),
    defaultValues: {
      job_id: jobId,
      currency,
      team_size: 1,
    },
  })

  const onSubmit = async (data: CreateOfferInput) => {
    setResult(null)
    const res = await createOffer(data)
    if (res.success) {
      toast.success(res.message || 'Oferta enviada')
      router.push('/instalador/ofertas')
    } else {
      setResult({ type: 'error', message: res.error || 'Error desconocido' })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register('job_id')} />
      <input type="hidden" {...register('currency')} />

      <h3 className="text-lg font-semibold text-gray-900">
        Enviar oferta
      </h3>

      <p className="text-sm text-gray-500">
        Para: <span className="font-medium text-gray-700">{jobTitle}</span>
      </p>

      {(budgetMin || budgetMax) && (
        <p className="text-sm text-gray-500">
          Presupuesto estimado por la empresa:{' '}
          <span className="font-medium text-green-700">
            {budgetMin && budgetMax
              ? `${budgetMin.toLocaleString()} - ${budgetMax.toLocaleString()} ${currency}`
              : budgetMin
              ? `Desde ${budgetMin.toLocaleString()} ${currency}`
              : `Hasta ${budgetMax?.toLocaleString()} ${currency}`}
          </span>
        </p>
      )}

      {result && (
        <Alert variant={result.type} onClose={() => setResult(null)}>
          {result.message}
        </Alert>
      )}

      <Input
        label="Precio propuesto *"
        type="number"
        {...register('proposed_price', { valueAsNumber: true })}
        error={errors.proposed_price?.message}
        placeholder={`ej: ${budgetMin || 50000}`}
        helperText={`En ${currency}`}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mensaje (opcional)
        </label>
        <textarea
          {...register('message')}
          rows={3}
          placeholder="Contale a la empresa por qué sos ideal para este trabajo..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Disponible desde"
          type="date"
          {...register('availability_start_date')}
          error={errors.availability_start_date?.message}
        />
        <Input
          label="Disponible hasta"
          type="date"
          {...register('availability_end_date')}
          error={errors.availability_end_date?.message}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Duración estimada (días)"
          type="number"
          {...register('estimated_duration_value', { valueAsNumber: true })}
          error={errors.estimated_duration_value?.message}
          placeholder="ej: 3"
        />
        <Input
          label="Tamaño del equipo"
          type="number"
          {...register('team_size', { valueAsNumber: true })}
          error={errors.team_size?.message}
          placeholder="ej: 2"
        />
      </div>

      <Button
        type="submit"
        isLoading={isSubmitting}
        fullWidth
      >
        <Send size={16} className="mr-2" />
        Enviar oferta
      </Button>
    </form>
  )
}
