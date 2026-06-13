'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/PageHeader'
import { JobForm } from '@/components/empresa/JobForm'
import { Alert } from '@/components/ui/Alert'
import { getJobDetail } from '@/lib/actions/jobs'
import type { JobDetails } from '@/types/database'
import type { CreateJobInput } from '@/lib/validations/job'

export default function EditarTrabajoPage() {
  const params = useParams()
  const jobId = params.id as string
  const [initialData, setInitialData] = useState<Partial<CreateJobInput> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadJob() {
      try {
        const job = await getJobDetail(jobId)
        if (!job) {
          setError('Trabajo no encontrado')
          return
        }
        if (job.status !== 'draft') {
          setError('Solo se pueden editar trabajos en borrador')
          return
        }

        const details = (job.details || {}) as JobDetails

        setInitialData({
          title: job.title,
          description: job.description || '',
          category_id: job.category_id,
          location_id: job.location_id || '',
          address: job.address || '',
          is_height_work: details.is_height_work || false,
          height_meters: details.height_meters || undefined,
          requires_special_tools: details.requires_special_tools || false,
          special_tools_description: details.special_tools_description || '',
          special_schedule: details.special_schedule || '',
          surface_type: details.surface_type || '',
          surface_dimensions: details.surface_dimensions || '',
          access_details: details.access_details || '',
          additional_notes: details.additional_notes || '',
          urgency: details.urgency || 'normal',
          budget_min: job.budget_min || undefined,
          budget_max: job.budget_max || undefined,
          currency: job.currency || 'ARS',
          start_date: job.start_date || '',
          end_date: job.end_date || '',
        })
      } catch (err) {
        setError('Error al cargar el trabajo')
      } finally {
        setIsLoading(false)
      }
    }
    if (jobId) loadJob()
  }, [jobId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="spinner border-primary-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Alert variant="error">{error}</Alert>
        <Link
          href={`/empresa/trabajos/${jobId}`}
          className="inline-flex items-center gap-1 mt-4 text-sm text-primary-500 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al trabajo
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link
        href={`/empresa/trabajos/${jobId}`}
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-primary-500 transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al trabajo
      </Link>

      <PageHeader
        title="Editar trabajo"
        description="Modifica los datos del borrador"
      />

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {initialData && (
          <JobForm mode="edit" jobId={jobId} initialData={initialData} />
        )}
      </div>
    </div>
  )
}
