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
  FileText,
  Clock,
  ArrowUpRight,
  AlertTriangle,
  Wrench,
  Ruler,
  Building2,
  StickyNote,
  Navigation,
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
import { formatDateLong } from '@/lib/utils/format'
import type { JobWithCompany, JobDetails } from '@/types/database'

const URGENCY_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  low: { label: 'Baja', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  normal: { label: 'Normal', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  high: { label: 'Alta', color: 'text-orange-700', bgColor: 'bg-orange-50' },
  urgent: { label: 'Urgente', color: 'text-red-700', bgColor: 'bg-red-50' },
}

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
        setSuccess(result.message || 'Enviado a revision')
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
    if (!confirm('Estas seguro de cancelar este trabajo?')) return

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
  const details = (job.details || {}) as JobDetails
  const urgency = details.urgency ? URGENCY_CONFIG[details.urgency] : null

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
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
            {job.category && (
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {job.category.name}
              </span>
            )}
            {urgency && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${urgency.bgColor} ${urgency.color}`}>
                <AlertTriangle className="h-3 w-3 mr-1" />
                Urgencia: {urgency.label}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isDraft && (
            <Button
              onClick={handleSubmitForReview}
              isLoading={actionLoading}
              size="sm"
            >
              <Send className="h-4 w-4 mr-1" />
              Enviar a revision
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
          {/* Descripcion */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Descripcion
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {job.description || 'Sin descripcion'}
            </p>
          </div>

          {/* Especificaciones tecnicas */}
          {(details.is_height_work || details.requires_special_tools || details.surface_type || details.surface_dimensions) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Especificaciones tecnicas
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Trabajo en altura */}
                {details.is_height_work && (
                  <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <ArrowUpRight className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800">Trabajo en altura</p>
                      {details.height_meters && (
                        <p className="text-sm text-amber-600">{details.height_meters} metros</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Si NO es en altura, mostrar que no lo es */}
                {details.is_height_work === false && (
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <ArrowUpRight className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">No es en altura</p>
                      <p className="text-sm text-green-600">Trabajo a nivel del suelo</p>
                    </div>
                  </div>
                )}

                {/* Herramientas especiales */}
                {details.requires_special_tools && (
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Wrench className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800">Herramientas especiales</p>
                      {details.special_tools_description && (
                        <p className="text-sm text-blue-600">{details.special_tools_description}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Superficie */}
                {details.surface_type && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Building2 className="h-5 w-5 text-gray-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-800">Tipo de superficie</p>
                      <p className="text-sm text-gray-600">{details.surface_type}</p>
                    </div>
                  </div>
                )}

                {/* Dimensiones */}
                {details.surface_dimensions && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Ruler className="h-5 w-5 text-gray-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-800">Dimensiones</p>
                      <p className="text-sm text-gray-600">{details.surface_dimensions}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Logistica y acceso */}
          {(details.special_schedule || details.access_details) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Logistica y acceso
              </h2>
              <div className="space-y-4">
                {details.special_schedule && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Restricciones de horario</p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{details.special_schedule}</p>
                    </div>
                  </div>
                )}
                {details.access_details && (
                  <div className="flex items-start gap-3">
                    <Navigation className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Detalles de acceso</p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{details.access_details}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notas adicionales */}
          {details.additional_notes && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                <StickyNote className="h-5 w-5 inline mr-2 text-gray-400" />
                Notas adicionales
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">{details.additional_notes}</p>
            </div>
          )}

          {/* Imagenes */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Archivos e imagenes
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

          {/* Ofertas recibidas */}
          {job.offers_count > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  Ofertas recibidas ({job.offers_count})
                </h2>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push('/empresa/ofertas')}
                >
                  Ver todas
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Gestioná las ofertas de los instaladores desde la seccion de ofertas.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar derecho */}
        <div className="space-y-4">
          {/* Ubicacion */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Ubicacion</h3>
            <dl className="space-y-3">
              {job.location && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <dt className="text-xs text-gray-500">Ciudad / Region</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {job.location.city_name}
                      {job.location.province_name && `, ${job.location.province_name}`}
                    </dd>
                  </div>
                </div>
              )}

              {job.address && (
                <div className="flex items-start gap-2">
                  <Navigation className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <dt className="text-xs text-gray-500">Direccion exacta</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {job.address}
                    </dd>
                  </div>
                </div>
              )}

              {!job.location && !job.address && (
                <p className="text-sm text-gray-400">Sin ubicacion especificada</p>
              )}
            </dl>
          </div>

          {/* Fechas */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Fechas</h3>
            <dl className="space-y-3">
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
            <p className="text-xs text-gray-500 mb-3">ofertas recibidas</p>
            {job.offers_count > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => router.push('/empresa/ofertas')}
              >
                Ver ofertas
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
