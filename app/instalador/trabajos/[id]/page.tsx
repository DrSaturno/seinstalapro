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
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { OfferForm } from '@/components/instalador/OfferForm'
import { getJobDetailForInstaller } from '@/lib/actions/offers'
import { formatCurrency, formatDate, formatRelativeDate } from '@/lib/utils/format'
import { OFFER_STATUS } from '@/lib/utils/status'
import { clsx } from 'clsx'
import type { Job, Company, Category, Location, Offer, Profile, OfferStatus } from '@/types/database'
import Link from 'next/link'

type JobDetail = Job & {
  company?: Company & { profile?: Pick<Profile, 'full_name'> }
  category?: Category
  location?: Location
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
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              {job.title}
            </h1>

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
