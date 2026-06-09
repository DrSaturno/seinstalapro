'use client'

import Link from 'next/link'
import { Calendar, MapPin, DollarSign, FileText, ClipboardList } from 'lucide-react'
import { JobStatusBadge } from './JobStatusBadge'
import { formatBudgetRange, formatRelativeDate } from '@/lib/utils/format'
import { truncate } from '@/lib/utils/format'
import type { JobWithCompany } from '@/types/database'

interface JobCardProps {
  job: JobWithCompany
  basePath?: string
}

export function JobCard({ job, basePath = '/empresa/trabajos' }: JobCardProps) {
  return (
    <Link
      href={`${basePath}/${job.id}`}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-primary-200 transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-lg font-semibold text-gray-900 leading-tight">
          {job.title}
        </h3>
        <JobStatusBadge status={job.status} />
      </div>

      {job.description && (
        <p className="text-sm text-gray-600 mb-4">
          {truncate(job.description, 120)}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
        {/* Categoría */}
        {job.category && (
          <span className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            {job.category.name}
          </span>
        )}

        {/* Ubicación */}
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {job.location.city_name}
          </span>
        )}

        {/* Presupuesto */}
        <span className="flex items-center gap-1">
          <DollarSign className="h-4 w-4" />
          {formatBudgetRange(job.budget_min, job.budget_max, job.currency)}
        </span>

        {/* Ofertas */}
        {job.offers_count > 0 && (
          <span className="flex items-center gap-1 text-primary-600 font-medium">
            <ClipboardList className="h-4 w-4" />
            {job.offers_count} oferta{job.offers_count !== 1 ? 's' : ''}
          </span>
        )}

        {/* Fecha */}
        {job.start_date && (
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(job.start_date).toLocaleDateString('es-AR', {
              day: 'numeric',
              month: 'short',
            })}
          </span>
        )}
      </div>

      {/* Fecha de creación */}
      <p className="mt-3 text-xs text-gray-400">
        Creado {formatRelativeDate(job.created_at)}
      </p>
    </Link>
  )
}
