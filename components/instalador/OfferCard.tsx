'use client'

import { clsx } from 'clsx'
import {
  Building2,
  Tag,
  DollarSign,
  Calendar,
  Users,
  Clock,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  MapPin,
  Briefcase,
} from 'lucide-react'
import { OFFER_STATUS } from '@/lib/utils/status'
import { formatCurrency, formatRelativeDate, formatBudgetRange } from '@/lib/utils/format'
import { Button } from '@/components/ui/Button'
import type { Offer, Job, Company, Category, OfferStatus } from '@/types/database'

interface OfferCardProps {
  offer: Offer & {
    job?: Job & { company?: Company; category?: Category }
  }
  onWithdraw?: (offerId: string) => void
  isWithdrawing?: boolean
  isExpanded?: boolean
  onToggleExpand?: () => void
}

export function OfferCard({
  offer,
  onWithdraw,
  isWithdrawing,
  isExpanded,
  onToggleExpand,
}: OfferCardProps) {
  const statusConfig = OFFER_STATUS[offer.status as OfferStatus]
  const job = offer.job as any
  const company = job?.company as any

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-5">
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

        {/* Info compacta */}
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

        {/* Mensaje truncado (solo cuando no expandido) */}
        {offer.message && !isExpanded && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {offer.message}
          </p>
        )}

        {/* Botón ver detalle */}
        {onToggleExpand && (
          <button
            onClick={onToggleExpand}
            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={16} />
                Ocultar detalle
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                Ver detalle completo
              </>
            )}
          </button>
        )}
      </div>

      {/* Detalle expandido */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-5 space-y-4">
          {/* Mi mensaje */}
          {offer.message && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Mi mensaje
              </h4>
              <div className="flex gap-2 p-3 bg-white rounded-lg border border-gray-100">
                <MessageSquare size={14} className="text-gray-400 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{offer.message}</p>
              </div>
            </div>
          )}

          {/* Propuesta económica */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Mi propuesta económica
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-green-600 mb-1">Precio propuesto</p>
                <p className="text-lg font-bold text-green-800">
                  {formatCurrency(offer.proposed_price, offer.currency)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Equipo</p>
                <p className="text-lg font-bold text-gray-800">
                  {offer.team_size} {offer.team_size === 1 ? 'persona' : 'personas'}
                </p>
              </div>
              {offer.estimated_duration_value && (
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Duración estimada</p>
                  <p className="text-lg font-bold text-gray-800">
                    ~{offer.estimated_duration_value} días
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Disponibilidad */}
          {(offer.availability_start_date || offer.availability_end_date) && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Disponibilidad
              </h4>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Calendar size={14} className="text-gray-400" />
                <span>
                  {offer.availability_start_date && (
                    <>Desde {offer.availability_start_date}</>
                  )}
                  {offer.availability_end_date && (
                    <> hasta {offer.availability_end_date}</>
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Datos del trabajo */}
          {job && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Datos del trabajo
              </h4>
              <div className="bg-white rounded-lg p-3 border border-gray-100 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <Briefcase size={14} className="text-gray-400" />
                  {job.title}
                </div>
                {company?.company_name && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 size={14} className="text-gray-400" />
                    {company.company_name}
                  </div>
                )}
                {job.category?.name && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Tag size={14} className="text-gray-400" />
                    {job.category.name}
                  </div>
                )}
                {(job.budget_min || job.budget_max) && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign size={14} className="text-gray-400" />
                    Presupuesto: {formatBudgetRange(job.budget_min, job.budget_max, job.budget_currency)}
                  </div>
                )}
                {job.address && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={14} className="text-gray-400" />
                    {offer.status === 'accepted' ? job.address : 'Dirección visible al aceptar'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fechas */}
          <div className="text-xs text-gray-400 pt-2 border-t border-gray-100 flex flex-wrap gap-3">
            <span>Enviada {formatRelativeDate(offer.submitted_at)}</span>
            {offer.reviewed_at && (
              <span>· Revisada {formatRelativeDate(offer.reviewed_at)}</span>
            )}
            {offer.accepted_at && (
              <span>· Aceptada {formatRelativeDate(offer.accepted_at)}</span>
            )}
            {offer.rejected_at && (
              <span>· Rechazada {formatRelativeDate(offer.rejected_at)}</span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
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
