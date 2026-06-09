'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Send,
  XCircle,
  Calendar,
  MapPin,
  DollarSign,
  FileText,
  Clock,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { JobStatusBadge } from '@/components/empresa/JobStatusBadge'
import { ImageUploader } from '@/components/empresa/ImageUploader'
import {
  getJobDetail,
  submitJobForReview,
  cancelJob,
  uploadJobFiles,
} from '@/lib/actions/jobs'
import { formatBudgetRange, formatDateLong } from '@/lib/utils/format'
import type { JobWithCompany } from '@/types/database'

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  const [job, setJob] = useState<JobWithCompany | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    async function loadJob() {
      try {
        const data = await getJobDetail(jobId)
        setJob(data)
      } catch (err) {
        setError('Error al cargar el trabajo')
      } finally {
        setIsLoading(false)
      }
    }
    if (jobId) loadJob()
  }, [jobId])

  const handleSubmitForReview = async () => {
    setActionLoading(true)
    setError(null)
    try {
      const result = await submitJobForReview(jobId)
      if (result.success) {
        setSuccess(result.message || 'Enviado a revisión')
        // Recargar
        const updated = await getJobDetail(jobId)
        setJob(updated)
      } else {
        setError(result.error || 'Error')
      }
    } catch (err) {
      setError('Error inesperado')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('¿Estás seguro de cancelar este trabajo?')) return

    setActionLoading(true)
    setError(null)
    try {
      const result = await cancelJob(jobId)
      if (result.success) {
        router.push('/empresa/trabajos')
      } else {
        setError(result.error || 'Error')
      }
    } catch (err) {
      setError('Error inesperado')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUploadFiles = async (formData: FormData) => {
    const result = await uploadJobFiles(jobId, formData)
    if (result.success) {
      // Recargar para ver archivos
      const updated = await getJobDetail(jobId)
      setJob(updated)
    }
    return result
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="spinner border-primary-500" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Alert variant="error">Trabajo no encontrado</Alert>
        <Link
          href="/empresa/trabajos"
          className="inline-flex items-center gap-1 mt-4 text-sm text-primary-500 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a trabajos
        </Link>
      </div>
    )
  }

  const isDraft = job.status === 'draft'
  const canCancel = ['draft', 'pending_admin_approval', 'published', 'receiving_offers'].includes(job.status)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link
        href="/empresa/trabajos"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-primary-500 transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a trabajos
      </Link>

      {error && (
        <Alert variant="error" onClose={() => setError(null)} className="mb-4">
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)} className="mb-4">
          {success}
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <JobStatusBadge status={job.status} />
          </div>
          {job.category && (
            <p className="text-sm text-gray-500">
              <FileText className="h-4 w-4 inline mr-1" />
              {job.category.name}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isDraft && (
            <Button
              onClick={handleSubmitForReview}
              isLoading={actionLoading}
              size="sm"
            >
              <Send className="h-4 w-4 mr-1" />
              Enviar a revisión
            </Button>
          )}
          {canCancel && (
            <Button
              variant="danger"
              onClick={handleCancel}
              isLoading={actionLoading}
              size="sm"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Descripción */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Descripción
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {job.description || 'Sin descripción'}
            </p>
          </div>

          {/* Imágenes */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Archivos e imágenes
            </h2>
            <ImageUploader
              onUpload={handleUploadFiles}
              existingFiles={
                (job.files || []).map((f) => ({
                  file_url: f.file_url,
                  file_name: f.file_name || undefined,
                  file_type: f.file_type,
                }))
              }
            />
          </div>

          {/* Ofertas recibidas (placeholder) */}
          {job.offers_count > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Ofertas recibidas ({job.offers_count})
              </h2>
              <p className="text-sm text-gray-500">
                Las ofertas se mostrarán aquí cuando los instaladores envíen sus propuestas.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar derecho */}
        <div className="space-y-4">
          {/* Detalles */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Detalles</h3>
            <dl className="space-y-3">
              <div className="flex items-start gap-2">
                <DollarSign className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <dt className="text-xs text-gray-500">Presupuesto</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {formatBudgetRange(job.budget_min, job.budget_max, job.currency)}
                  </dd>
                </div>
              </div>

              {job.location && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <dt className="text-xs text-gray-500">Ubicación</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {job.location.city_name}
                      {job.location.province_name && `, ${job.location.province_name}`}
                    </dd>
                  </div>
                </div>
              )}

              {job.start_date && (
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <dt className="text-xs text-gray-500">Fecha inicio</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {formatDateLong(job.start_date)}
                    </dd>
                  </div>
                </div>
              )}

              {job.end_date && (
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <dt className="text-xs text-gray-500">Fecha fin</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {formatDateLong(job.end_date)}
                    </dd>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <dt className="text-xs text-gray-500">Creado</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {formatDateLong(job.created_at)}
                  </dd>
                </div>
              </div>
            </dl>
          </div>

          {/* Info de ofertas */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-2">Ofertas</h3>
            <p className="text-3xl font-bold text-primary-500">
              {job.offers_count}
            </p>
            <p className="text-xs text-gray-500">ofertas recibidas</p>
          </div>
        </div>
      </div>
    </div>
  )
}
