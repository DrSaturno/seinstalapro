'use client'

import { clsx } from 'clsx'
import {
  DollarSign,
  Users,
  Calendar,
  Star,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Clock,
  Wrench,
  Phone,
  Mail,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { OFFER_STATUS } from '@/lib/utils/status'
import { formatCurrency, formatRelativeDate, formatDateLong } from '@/lib/utils/format'
import type { OfferWithInstaller } from '@/lib/actions/types'
import type { OfferStatus } from '@/types/database'

interface ReceivedOfferCardProps {
  offer: OfferWithInstaller
  onShortlist?: (offerId: string) => void
  onAccept?: (offerId: string) => void
  onReject?: (offerId: string) => void
  isActioning?: boolean
  isExpanded?: boolean
  onToggleExpand?: () => void
}

export function ReceivedOfferCard({
  offer,
  onShortlist,
  onAccept,
  onReject,
  isActioning,
  isExpanded,
  onToggleExpand,
}: ReceivedOfferCardProps) {
  const statusConfig = OFFER_STATUS[offer.status as OfferStatus]
  const installer = offer.installer
  const profile = installer?.profile

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header compacto */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
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
                  <span className="text-xs">Sin resenas aun</span>
                )}
                {installer?.years_of_experience && (
                  <span>· {installer.years_of_experience} anos exp.</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
        </div>

        {/* Resumen de la oferta */}
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

          {offer.estimated_duration_value && (
            <div className="flex items-center gap-1.5 text-gray-500">
              <Clock size={14} />
              <span>~{offer.estimated_duration_value} dias</span>
            </div>
          )}

          {offer.availability_start_date && (
            <div className="flex items-center gap-1.5 text-gray-500">
              <Calendar size={14} />
              <span>
                Desde {offer.availability_start_date}
              </span>
            </div>
          )}
        </div>

        {/* Boton ver detalle */}
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
      </div>

      {/* Detalle expandido */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-white p-4 space-y-4">
          {/* Mensaje del instalador */}
          {offer.message && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Mensaje del instalador
              </h4>
              <div className="flex gap-2 p-3 bg-gray-50 rounded-lg">
                <MessageSquare size={14} className="text-gray-400 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{offer.message}</p>
              </div>
            </div>
          )}

          {/* Detalles economicos */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Propuesta economica
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-green-600 mb-1">Precio propuesto</p>
                <p className="text-lg font-bold text-green-800">
                  {formatCurrency(offer.proposed_price, offer.currency)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Equipo</p>
                <p className="text-lg font-bold text-gray-800">
                  {offer.team_size} {offer.team_size === 1 ? 'persona' : 'personas'}
                </p>
              </div>
              {offer.estimated_duration_value && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Duracion estimada</p>
                  <p className="text-lg font-bold text-gray-800">
                    ~{offer.estimated_duration_value} dias
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

          {/* Datos del instalador */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Sobre el instalador
            </h4>
            <div className="space-y-2">
              {installer?.bio && (
                <p className="text-sm text-gray-600">{installer.bio}</p>
              )}

              <div className="flex flex-wrap gap-3 text-sm">
                {installer?.years_of_experience && (
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <Wrench size={14} className="text-gray-400" />
                    {installer.years_of_experience} anos de experiencia
                  </span>
                )}
                {installer?.is_verified && (
                  <span className="flex items-center gap-1 text-green-600 font-medium">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verificado
                  </span>
                )}
              </div>

              {profile?.email && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Mail size={14} className="text-gray-400" />
                  {profile.email}
                </div>
              )}
              {profile?.phone && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Phone size={14} className="text-gray-400" />
                  {profile.phone}
                </div>
              )}
            </div>
          </div>

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

      {/* Footer: Acciones */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
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
