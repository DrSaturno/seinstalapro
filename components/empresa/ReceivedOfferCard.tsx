'use client'

import { clsx } from 'clsx'
import {
  DollarSign,
  Users,
  Calendar,
  Star,
  MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { OFFER_STATUS } from '@/lib/utils/status'
import { formatCurrency, formatRelativeDate } from '@/lib/utils/format'
import type { Offer, Installer, Profile, OfferStatus } from '@/types/database'

interface ReceivedOfferCardProps {
  offer: Offer & {
    installer?: Installer & { profile?: Profile }
  }
  onShortlist?: (offerId: string) => void
  onAccept?: (offerId: string) => void
  onReject?: (offerId: string) => void
  isActioning?: boolean
}

export function ReceivedOfferCard({
  offer,
  onShortlist,
  onAccept,
  onReject,
  isActioning,
}: ReceivedOfferCardProps) {
  const statusConfig = OFFER_STATUS[offer.status as OfferStatus]
  const installer = offer.installer
  const profile = installer?.profile

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {/* Header: Instalador + Estado */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <Avatar
            fallback={profile?.full_name || 'Instalador'}
            src={profile?.avatar_url}
            size="md"
          />
          <div>
            <p className="font-semibold text-gray-900">
              {profile?.full_name || 'Instalador'}
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {installer?.avg_rating ? (
                <span className="flex items-center gap-0.5">
                  <Star size={12} className="text-yellow-500 fill-yellow-500" />
                  {installer.avg_rating.toFixed(1)}
                  <span className="text-xs">({installer.total_reviews})</span>
                </span>
              ) : (
                <span className="text-xs">Sin reseñas aún</span>
              )}
              {installer?.years_of_experience && (
                <span>· {installer.years_of_experience} años exp.</span>
              )}
            </div>
          </div>
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
        <div className="flex items-center gap-1.5 text-green-700 font-semibold">
          <DollarSign size={14} />
          <span>{formatCurrency(offer.proposed_price, offer.currency)}</span>
        </div>

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
              Disponible: {offer.availability_start_date}
              {offer.availability_end_date
                ? ` — ${offer.availability_end_date}`
                : ''}
            </span>
          </div>
        )}

        {offer.estimated_duration_value && (
          <span className="text-gray-500">
            Duración: ~{offer.estimated_duration_value} días
          </span>
        )}
      </div>

      {/* Mensaje del instalador */}
      {offer.message && (
        <div className="flex gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
          <MessageSquare size={14} className="text-gray-400 shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600">{offer.message}</p>
        </div>
      )}

      {/* Footer: Acciones + fecha */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">
          {formatRelativeDate(offer.submitted_at)}
        </span>

        <div className="flex gap-2">
          {offer.status === 'sent' && (
            <>
              {onShortlist && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onShortlist(offer.id)}
                  disabled={isActioning}
                >
                  Preseleccionar
                </Button>
              )}
              {onReject && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onReject(offer.id)}
                  disabled={isActioning}
                >
                  Rechazar
                </Button>
              )}
              {onAccept && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => onAccept(offer.id)}
                  disabled={isActioning}
                >
                  Aceptar
                </Button>
              )}
            </>
          )}
          {offer.status === 'shortlisted' && (
            <>
              {onReject && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onReject(offer.id)}
                  disabled={isActioning}
                >
                  Rechazar
                </Button>
              )}
              {onAccept && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => onAccept(offer.id)}
                  disabled={isActioning}
                >
                  Aceptar oferta
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
