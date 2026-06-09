'use client'

import Link from 'next/link'
import { MapPin, Calendar, DollarSign, Building2, Tag } from 'lucide-react'
import { formatCurrency, formatRelativeDate } from '@/lib/utils/format'
import type { Job, Company, Category, Location, Profile } from '@/types/database'

interface JobSearchCardProps {
  job: Job & {
    company?: Company & { profile?: Pick<Profile, 'full_name'> }
    category?: Category
    location?: Location
  }
}

export function JobSearchCard({ job }: JobSearchCardProps) {
  const company = job.company as any

  return (
    <Link href={`/instalador/trabajos/${job.id}`}>
      <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-semibold text-gray-900 line-clamp-1">
            {job.title}
          </h3>
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {formatRelativeDate(job.published_at || job.created_at)}
          </span>
        </div>

        {/* Descripción */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {job.description}
        </p>

        {/* Metadata */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
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
                {job.location.province_name ? `, ${job.location.province_name}` : ''}
              </span>
            </div>
          )}

          {(job.budget_min || job.budget_max) && (
            <div className="flex items-center gap-1.5 text-green-700 font-medium">
              <DollarSign size={14} />
              <span>
                {job.budget_min && job.budget_max
                  ? `${formatCurrency(job.budget_min, job.currency)} - ${formatCurrency(job.budget_max, job.currency)}`
                  : job.budget_min
                  ? `Desde ${formatCurrency(job.budget_min, job.currency)}`
                  : `Hasta ${formatCurrency(job.budget_max!, job.currency)}`}
              </span>
            </div>
          )}

          {(job.start_date || job.end_date) && (
            <div className="flex items-center gap-1.5 text-gray-500">
              <Calendar size={14} />
              <span>
                {job.start_date && job.end_date
                  ? `${job.start_date} — ${job.end_date}`
                  : job.start_date
                  ? `Desde ${job.start_date}`
                  : `Hasta ${job.end_date}`}
              </span>
            </div>
          )}
        </div>

        {/* Ofertas */}
        {job.offers_count > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              {job.offers_count} {job.offers_count === 1 ? 'oferta enviada' : 'ofertas enviadas'}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
