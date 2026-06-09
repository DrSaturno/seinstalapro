'use client'

import { clsx } from 'clsx'
import { Building2, Tag, DollarSign, Calendar, Users } from 'lucide-react'
import { OFFER_STATUS } from '@/lib/utils/status'
import { formatCurrency, formatRelativeDate } from '@/lib/utils/format'
import { Button } from '@/components/ui/Button'
import type { Offer, Job, Company, Category, OfferStatus } from '@/types/database'

interface OfferCardProps {
  offer: Offer & {
    job?: Job & { company?: Company; category?: Category }
  }
  onWithdraw?: (offerId: string) => void
  isWithdrawing?: boolean
}

export function OfferCard({ offer, onWithdraw, isWithdrawing }: OfferCardProps) {
  const statusConfig = OFFER_STATUS[offer.status as OfferStatus]
  const job = offer.job as any
  const company = job?.company as any

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 line-clamp-1">
            {job?.title || 'Trabajo'}
          </h3>
          {company?.company_name && (
            <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
              <Building2 size={14} />
              <span>{company.company_name}</span>
            </div>
          )}
        </div>
        {statusConfig && (
          <span
            className={clsx(
              'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0',
              statusConfig.bgColor,
              statusConfig.color
            )}
          >
            {statusConfig.label}
          </span>
        )}
      </div>

      {/* Info de la oferta */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm mb-3">
        <div className="flex items-center gap-1.5 text-green-700 font-medium">
          <DollarSign size={14} />
          <span>{formatCurrency(offer.proposed_price, offer.currency)}</span>
        </div>

        {job?.category?.name && (
          <div className="flex items-center gap-1.5 text-gray-500">
            <Tag size={14} />
            <span>{job.category.name}</span>
          </div>
        )}

        {offer.team_size > 1 && (
          <div className="flex items-center gap-1.5 text-gray-500">
            <Users size={14} />
            <span>{offer.team_size} personas</span>
          </div>
        )}

        {offer.availability_start_date && (
          <div className="flex items-center gap-1.5 text-gray-500">
            <Calendar size={14} />
            <span>
              {offer.availability_start_date}
              {offer.availability_end_date ? ` — ${offer.availability_end_date}` : ''}
            </span>
          </div>
        )}
      </div>

      {/* Mensaje */}
      {offer.message && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {offer.message}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">
          Enviada {formatRelativeDate(offer.submitted_at)}
        </span>

        {offer.status === 'sent' && onWithdraw && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onWithdraw(offer.id)}
            isLoading={isWithdrawing}
          >
            Retirar oferta
          </Button>
        )}
      </div>
    </div>
  )
}
