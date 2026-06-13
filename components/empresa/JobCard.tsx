'use client'

import Link from 'next/link'
import {
  Calendar,
  MapPin,
  FileText,
  ClipboardList,
  Eye,
  ArrowUpRight,
  AlertTriangle,
  Clock,
} from 'lucide-react'
import { JobStatusBadge } from './JobStatusBadge'
import { formatRelativeDate } from '@/lib/utils/format'
import { truncate } from '@/lib/utils/format'
import { Button } from '@/components/ui/Button'
import type { JobWithCompany, JobDetails } from '@/types/database'

interface JobCardProps {
  job: JobWithCompany
  basePath?: string
}

const URGENCY_LABELS: Record<string, { label: string; color: string }> = {
  low: { label: 'Baja', color: 'text-gray-500' },
  normal: { label: 'Normal', color: 'text-blue-600' },
  high: { label: 'Alta', color: 'text-orange-600' },
  urgent: { label: 'Urgente', color: 'text-red-600' },
}

export function JobCard({ job, basePath = '/empresa/trabajos' }: JobCardProps) {
  const details = (job.details || {}) as JobDetails
  const urgency = details.urgency ? URGENCY_LABELS[details.urgency] : null

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-primary-200 transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight">
            {job.title}
          </h3>
          {job.description && (
            <p className="text-sm text-gray-600 mt-1">
              {truncate(job.description, 120)}
            </p>
          )}
        </div>
        <JobStatusBadge status={job.status} />
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
        {/* Categoria */}
        {job.category && (
          <span className="flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" />
            {job.category.name}
          </span>
        )}

        {/* Ubicacion */}
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {job.location.city_name}
          </span>
        )}

        {/* Urgencia */}
        {urgency && urgency.label !== 'Normal' && (
          <span className={`flex items-center gap-1 font-medium ${urgency.color}`}>
            <AlertTriangle className="h-3.5 w-3.5" />
            {urgency.label}
          </span>
        )}

        {/* Trabajo en altura */}
        {details.is_height_work && (
          <span className="flex items-center gap-1 text-amber-600 font-medium">
            <ArrowUpRight className="h-3.5 w-3.5" />
            En altura
          </span>
        )}

        {/* Ofertas */}
        {job.offers_count > 0 && (
          <span className="flex items-center gap-1 text-primary-600 font-medium">
            <ClipboardList className="h-3.5 w-3.5" />
            {job.offers_count} oferta{job.offers_count !== 1 ? 's' : ''}
          </span>
        )}

        {/* Fecha */}
        {job.start_date && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(job.start_date).toLocaleDateString('es-AR', {
              day: 'numeric',
              month: 'short',
            })}
          </span>
        )}
      </div>

      {/* Footer: Fecha + Boton */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="h-3 w-3" />
          Creado {formatRelativeDate(job.created_at)}
        </span>

        <Link href={`${basePath}/${job.id}`}>
          <Button size="sm" variant="outline">
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            Ver detalle
          </Button>
        </Link>
      </div>
    </div>
  )
}
