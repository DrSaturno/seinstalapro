'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Building2,
  Tag,
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Wrench,
  Ruler,
  Navigation,
  AlertTriangle,
  StickyNote,
  FileText,
  Lock,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { OfferForm } from '@/components/instalador/OfferForm'
import { getJobDetailForInstaller } from '@/lib/actions/offers'
import { formatCurrency, formatDate, formatRelativeDate } from '@/lib/utils/format'
import { OFFER_STATUS } from '@/lib/utils/status'
import { clsx } from 'clsx'
import type { Job, Company, Category, Location, Offer, Profile, OfferStatus, JobDetails, JobFile } from '@/types/database'
import Link from 'next/link'

type JobDetail = Job & {
  company?: Company & { profile?: Pick<Profile, 'full_name'> }
  category?: Category
  location?: Location
  files?: JobFile[]
}

const URGENCY_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  low: { label: 'Baja', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  normal: { label: 'Normal', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  high: { label: 'Alta', color: 'text-orange-700', bgColor: 'bg-orange-50' },
  urgent: { label: 'Urgente', color: 'text-red-700', bgColor: 'bg-red-50' },
}

export default function InstaladorTrabajoDetallePage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  const [job, setJob] = useState<JobDetail | null>(null)
  const [myOffer, setMyOffer] = useState<Offer | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { job: jobData, myOffer: offerData } =
          await getJobDetailForInstaller(jobId)
        setJob(jobData)
        setMyOffer(offerData)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [jobId])

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Alert variant="error">
          Trabajo no encontrado o ya no está disponible.
        </Alert>
        <Link href="/instalador/trabajos">
          <Button variant="ghost" className="mt-4">
            <ArrowLeft size={16} className="mr-2" />
            Volver a búsqueda
          </Button>
        </Link>
      </div>
    )
  }

  const company = job.company as any
  const canOffer =
    !myOffer &&
    (job.status === 'published' || job.status === 'receiving_offers')

  const offerStatusConfig = myOffer
    ? OFFER_STATUS[myOffer.status as OfferStatus]
    : null

  const details = (job.details || {}) as JobDetails
  const urgency = details.urgency ? URGENCY_CONFIG[details.urgency] : null
  const jobImages = (job.files || []).filter((f) => f.file_type === 'image')
  const jobDocs = (job.files || []).filter((f) => f.file_type !== 'image')
  // La dirección exacta solo se revela cuando la oferta fue aceptada
  const showExactAddress = myOffer?.status === 'accepted'

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Volver */}
      <Link href="/instalador/trabajos">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft size={16} className="mr-1" />
          Volver a búsqueda
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detalle del trabajo */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1 className="text-xl font-bold text-gray-900">
                {job.title}
              </h1>
              {urgency && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${urgency.bgColor} ${urgency.color}`}>
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {urgency.label}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm mb-4">
              {company?.company_name && (
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Building2 size={14} />
                  <span>{company.company_name}</span>
                </div>
              )}
              {job.category?.name && (
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Tag size={14} />
                  <span>{job.category.name}</span>
                </div>
              )}
              {job.location && (
                <div className="flex items-center gap-1.5 text-gray-500">
                  <MapPin size={14} />
                  <span>
                    {job.location.city_name}
                    {job.location.province_name
                      ? `, ${job.location.province_name}`
                      : ''}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-gray-400">
                <Clock size={14} />
                <span>Publicado {formatRelativeDate(job.published_at || job.created_at)}</span>
              </div>
            </div>

            {/* Presupuesto */}
            {(job.budget_min || job.budget_max) && (
              <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 rounded-lg">
                <DollarSign size={18} className="text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Presupuesto estimado
                  </p>
                  <p className="text-lg font-bold text-green-700">
                    {job.budget_min && job.budget_max
                      ? `${formatCurrency(job.budget_min, job.currency)} - ${formatCurrency(job.budget_max, job.currency)}`
                      : job.budget_min
                      ? `Desde ${formatCurrency(job.budget_min, job.currency)}`
                      : `Hasta ${formatCurrency(job.budget_max!, job.currency)}`}
                  </p>
                </div>
              </div>
            )}

            {/* Fechas */}
            {(job.start_date || job.end_date) && (
              <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
                <Calendar size={18} className="text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Fechas del trabajo
                  </p>
                  <p className="text-sm text-blue-700">
                    {job.start_date && job.end_date
                      ? `${formatDate(job.start_date)} — ${formatDate(job.end_date)}`
                      : job.start_date
                      ? `Desde ${formatDate(job.start_date)}`
                      : `Hasta ${formatDate(job.end_date!)}`}
                  </p>
                </div>
              </div>
            )}

            {/* Descripción completa */}
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Descripción del trabajo
              </h3>
              <div className="text-sm text-gray-600 whitespace-pre-wrap">
                {job.description}
              </div>
            </div>
          </div>

          {/* Especificaciones técnicas */}
          {(details.is_height_work !== undefined ||
            details.requires_special_tools ||
            details.surface_type ||
            details.surface_dimensions) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Especificaciones técnicas
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {details.is_height_work && (
                  <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <ArrowUpRight className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800">Trabajo en altura</p>
                      {details.height_meters && (
                        <p className="text-sm text-amber-600">
                          {details.height_meters} metros — necesitarás equipamiento de seguridad
                        </p>
                      )}
                    </div>
                  </div>
                )}
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
                {details.surface_type && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Building2 className="h-5 w-5 text-gray-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-800">Tipo de superficie</p>
                      <p className="text-sm text-gray-600">{details.surface_type}</p>
                    </div>
                  </div>
                )}
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

          {/* Logística y acceso */}
          {(details.special_schedule || details.access_details || job.address) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Logística y acceso
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
                {job.address && (
                  <div className="flex items-start gap-3">
                    {showExactAddress ? (
                      <>
                        <MapPin className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Dirección exacta</p>
                          <p className="text-sm text-gray-600">{job.address}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Lock className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Dirección exacta</p>
                          <p className="text-sm text-gray-400 italic">
                            Se revela cuando tu oferta sea aceptada
                          </p>
                        </div>
                      </>
                    )}
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
                Consideraciones adicionales
              </h2>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{details.additional_notes}</p>
            </div>
          )}

          {/* Imágenes y archivos */}
          {(jobImages.length > 0 || jobDocs.length > 0) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Imágenes y archivos ({(job.files || []).length})
              </h2>
              {jobImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {jobImages.map((file) => (
                    <a
                      key={file.id}
                      href={file.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg border border-gray-200 overflow-hidden aspect-square hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={file.file_url}
                        alt={file.file_name || 'Imagen del trabajo'}
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              )}
              {jobDocs.length > 0 && (
                <div className="space-y-2">
                  {jobDocs.map((file) => (
                    <a
                      key={file.id}
                      href={file.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700 truncate">
                        {file.file_name || 'Documento'}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Columna lateral - Oferta */}
        <div className="space-y-4">
          {/* Mi oferta existente */}
          {myOffer && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={18} className="text-primary-600" />
                <h3 className="font-semibold text-gray-900">Tu oferta</h3>
              </div>

              {offerStatusConfig && (
                <span
                  className={clsx(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mb-3',
                    offerStatusConfig.bgColor,
                    offerStatusConfig.color
                  )}
                >
                  {offerStatusConfig.label}
                </span>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Precio:</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(myOffer.proposed_price, myOffer.currency)}
                  </span>
                </div>
                {myOffer.team_size > 1 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Equipo:</span>
                    <span className="text-gray-900">{myOffer.team_size} personas</span>
                  </div>
                )}
                {myOffer.availability_start_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Disponibilidad:</span>
                    <span className="text-gray-900">
                      {myOffer.availability_start_date}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Enviada:</span>
                  <span className="text-gray-900">
                    {formatRelativeDate(myOffer.submitted_at)}
                  </span>
                </div>
              </div>

              {myOffer.message && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Tu mensaje:</p>
                  <p className="text-sm text-gray-600">{myOffer.message}</p>
                </div>
              )}
            </div>
          )}

          {/* Formulario de nueva oferta */}
          {canOffer && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <OfferForm
                jobId={job.id}
                jobTitle={job.title}
                budgetMin={job.budget_min}
                budgetMax={job.budget_max}
                currency={job.currency}
              />
            </div>
          )}

          {/* No puede ofertar */}
          {!canOffer && !myOffer && (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 text-center">
              <p className="text-sm text-gray-500">
                Este trabajo ya no acepta ofertas nuevas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
