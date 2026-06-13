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
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { OFFER_STATUS } from '@/lib/utils/status'
import { formatCurrency, formatRelativeDate } from '@/lib/utils/format'
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
  const isRecommended = (installer?.avg_rating || 0) >= 4.5

  return (
    <div
      className={clsx(
        'bg-white rounded-3xl border transition-all duration-300 relative flex flex-col justify-between overflow-hidden',
        isRecommended
          ? 'border-primary-100 shadow-[0_12px_30px_-4px_rgba(37,99,235,0.06)] ring-1 ring-primary-100/50'
          : 'border-slate-100 shadow-sm shadow-slate-100/40'
      )}
    >
      {/* Badge Recomendado / Estado */}
      <div className="absolute top-3 right-3 z-10 flex gap-1.5 items-center">
        {isRecommended && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100/50 shadow-sm shadow-amber-500/5">
            <Star size={10} className="fill-current" />
            Recomendado
          </span>
        )}
      </div>

      <div className="p-6 pb-4 flex-1">
        {/* Info Instalador */}
        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <Avatar
            fallback={profile?.full_name || 'Instalador'}
            src={profile?.avatar_url}
            size="lg"
            className="ring-4 ring-slate-50"
          />
          <h4 className="font-extrabold text-slate-800 mt-3 flex items-center gap-1.5 text-base">
            {profile?.full_name || 'Instalador'}
            {installer?.is_verified && (
              <ShieldCheck className="h-4 w-4 text-emerald-500 fill-emerald-50" />
            )}
          </h4>
          <span className="text-xs text-slate-400 mt-0.5">Instalador Gráfico</span>
        </div>

        {/* Precio Destacado */}
        <div className="text-center bg-slate-50 rounded-2xl py-4.5 px-4 mb-6 border border-slate-100/50">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Precio Total</span>
          <span className="text-2xl font-extrabold text-slate-800 mt-1 block">
            {formatCurrency(offer.proposed_price, offer.currency)}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Incluye impuestos</span>
        </div>

        {/* Tabla Comparativa de Atributos */}
        <div className="divide-y divide-slate-100 text-sm">
          <div className="py-3 flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-400">Calificación promedio</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              {installer?.avg_rating ? (
                <>
                  <Star size={14} className="text-amber-500 fill-amber-500" />
                  {installer.avg_rating.toFixed(1)}
                  <span className="text-xs font-medium text-slate-400">({installer.total_reviews})</span>
                </>
              ) : (
                <span className="text-xs font-medium text-slate-400 italic">Sin reseñas</span>
              )}
            </span>
          </div>

          <div className="py-3 flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-400">Experiencia</span>
            <span className="font-bold text-slate-800">
              {installer?.years_of_experience
                ? `${installer.years_of_experience} años`
                : '--'}
            </span>
          </div>

          <div className="py-3 flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-400">Disponibilidad</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              {offer.availability_start_date ? (
                <>
                  <Calendar size={14} className="text-slate-400" />
                  <span className="text-xs truncate max-w-[120px]">{offer.availability_start_date}</span>
                </>
              ) : (
                'Inmediata'
              )}
            </span>
          </div>

          <div className="py-3 flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-400">Duración estimada</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              {offer.estimated_duration_value ? (
                <>
                  <Clock size={14} className="text-slate-400" />
                  <span>{offer.estimated_duration_value} días</span>
                </>
              ) : (
                'A coordinar'
              )}
            </span>
          </div>

          <div className="py-3 flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-400">Equipo</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <Users size={14} className="text-slate-400" />
              <span>{offer.team_size} {offer.team_size === 1 ? 'persona' : 'personas'}</span>
            </span>
          </div>
        </div>

        {/* Botón Detalles Desplegables */}
        <div className="mt-4 pt-1 flex justify-center">
          <button
            onClick={onToggleExpand}
            className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-bold transition-colors py-1 px-3 rounded-full hover:bg-primary-50"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={14} />
                Ocultar mensaje
              </>
            ) : (
              <>
                <ChevronDown size={14} />
                Ver detalles y contacto
              </>
            )}
          </button>
        </div>
      </div>

      {/* Detalle expandido */}
      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-6 space-y-4 text-sm">
          {/* Mensaje del instalador */}
          {offer.message && (
            <div>
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Mensaje de la propuesta
              </h5>
              <div className="flex gap-2.5 p-3.5 bg-white rounded-2xl border border-slate-100">
                <MessageSquare size={16} className="text-slate-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                  {offer.message}
                </p>
              </div>
            </div>
          )}

          {/* Información de contacto */}
          <div>
            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Contacto verificado
            </h5>
            <div className="space-y-1.5 bg-white rounded-2xl border border-slate-100 p-3.5">
              {profile?.email && (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Mail size={14} className="text-slate-400" />
                  <span className="truncate">{profile.email}</span>
                </div>
              )}
              {profile?.phone && (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Phone size={14} className="text-slate-400" />
                  <span>{profile.phone}</span>
                </div>
              )}
            </div>
          </div>

          {installer?.bio && (
            <div>
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Bio del Instalador
              </h5>
              <p className="text-xs text-slate-500 leading-relaxed pl-1">{installer.bio}</p>
            </div>
          )}

          <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 flex flex-wrap gap-2 justify-between">
            <span>Enviada {formatRelativeDate(offer.submitted_at)}</span>
            {statusConfig && (
              <span className={clsx('font-bold uppercase tracking-wider', statusConfig.color)}>
                {statusConfig.label}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer: Botones de Acción */}
      <div className="flex flex-col gap-2 p-6 border-t border-slate-100 bg-slate-50/20">
        {offer.status === 'sent' && (
          <div className="flex gap-2 w-full">
            {onReject && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onReject(offer.id)}
                disabled={isActioning}
                className="flex-1 font-semibold text-xs border border-slate-200"
              >
                Rechazar
              </Button>
            )}
            {onShortlist && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onShortlist(offer.id)}
                disabled={isActioning}
                className="flex-1 font-semibold text-xs"
              >
                Preseleccionar
              </Button>
            )}
            {onAccept && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => onAccept(offer.id)}
                disabled={isActioning}
                className="flex-1 font-bold text-xs"
              >
                Aceptar
              </Button>
            )}
          </div>
        )}

        {offer.status === 'shortlisted' && (
          <div className="flex gap-2 w-full">
            {onReject && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onReject(offer.id)}
                disabled={isActioning}
                className="flex-1 font-semibold text-xs border border-slate-200"
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
                className="flex-1 font-bold text-xs"
              >
                Seleccionar
              </Button>
            )}
          </div>
        )}

        {offer.status !== 'sent' && offer.status !== 'shortlisted' && statusConfig && (
          <div className="text-center py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-500">
            Propuesta {statusConfig.label.toLowerCase()}
          </div>
        )}
      </div>
    </div>
  )
}
