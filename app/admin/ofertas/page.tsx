'use client'

import { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import {
  ClipboardList,
  Search,
  DollarSign,
  Users,
  Calendar,
  Clock,
  Star,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Building2,
  Mail,
  Phone,
  Wrench,
  Tag,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonCardList } from '@/components/ui/Skeleton'
import { Avatar } from '@/components/ui/Avatar'
import { Input } from '@/components/ui/Input'
import { OFFER_STATUS } from '@/lib/utils/status'
import { formatCurrency, formatRelativeDate } from '@/lib/utils/format'
import { getAdminOffers } from '@/lib/actions/admin'
import type { OfferStatus } from '@/types/database'

type AdminOffer = Awaited<ReturnType<typeof getAdminOffers>>[number]

const STATUS_FILTERS = [
  { value: 'all', label: 'Todas' },
  { value: 'sent', label: 'Enviadas' },
  { value: 'shortlisted', label: 'Preseleccionadas' },
  { value: 'accepted', label: 'Aceptadas' },
  { value: 'rejected', label: 'Rechazadas' },
  { value: 'withdrawn', label: 'Retiradas' },
]

export default function AdminOfertasPage() {
  const [offers, setOffers] = useState<AdminOffer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const loadOffers = async () => {
    setIsLoading(true)
    try {
      const data = await getAdminOffers({ status: filter, search })
      setOffers(data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOffers()
  }, [filter])

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadOffers()
    }, 300)
    return () => clearTimeout(timeout)
  }, [search])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Ofertas"
        description="Todas las ofertas de la plataforma"
      />

      {/* Búsqueda */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por instalador, trabajo o empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap mb-6">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {isLoading ? (
        <SkeletonCardList count={4} />
      ) : offers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <EmptyState
            icon={ClipboardList}
            title="No hay ofertas"
            description={
              search
                ? 'No se encontraron ofertas con esa búsqueda.'
                : 'Aún no se registraron ofertas en la plataforma.'
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => (
            <AdminOfferCard
              key={offer.id}
              offer={offer}
              isExpanded={expandedId === offer.id}
              onToggleExpand={() =>
                setExpandedId(expandedId === offer.id ? null : offer.id)
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}

function AdminOfferCard({
  offer,
  isExpanded,
  onToggleExpand,
}: {
  offer: AdminOffer
  isExpanded: boolean
  onToggleExpand: () => void
}) {
  const statusConfig = OFFER_STATUS[offer.status as OfferStatus]
  const installer = offer.installer as any
  const profile = installer?.profile
  const job = offer.job as any
  const company = offer.company as any

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar
              fallback={profile?.full_name || 'Instalador'}
              src={profile?.avatar_url}
              size="md"
            />
            <div className="min-w-0">
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
                  <span className="text-xs">Sin reseñas</span>
                )}
                <span className="text-gray-300">|</span>
                <span className="truncate">{job?.title || 'Trabajo'}</span>
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

        {/* Info compacta */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm mb-3">
          <div className="flex items-center gap-1.5 text-green-700 font-semibold">
            <DollarSign size={14} />
            <span>{formatCurrency(offer.proposed_price, offer.currency)}</span>
          </div>

          {company?.company_name && (
            <div className="flex items-center gap-1.5 text-gray-500">
              <Building2 size={14} />
              <span>{company.company_name}</span>
            </div>
          )}

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
        </div>

        {/* Botón ver detalle */}
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
        <div className="border-t border-gray-200 bg-gray-50 p-5 space-y-4">
          {/* Mensaje del instalador */}
          {offer.message && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Mensaje del instalador
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
              Propuesta económica
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

          {/* Datos del instalador */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Sobre el instalador
            </h4>
            <div className="bg-white rounded-lg p-3 border border-gray-100 space-y-2">
              {installer?.bio && (
                <p className="text-sm text-gray-600">{installer.bio}</p>
              )}
              <div className="flex flex-wrap gap-3 text-sm">
                {installer?.years_of_experience && (
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <Wrench size={14} className="text-gray-400" />
                    {installer.years_of_experience} años de experiencia
                  </span>
                )}
              </div>
              {profile?.email && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Mail size={14} className="text-gray-400" />
                  {profile.email}
                </div>
              )}
            </div>
          </div>

          {/* Datos del trabajo */}
          {job && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Trabajo asociado
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
                    {company.profile?.full_name && (
                      <span className="text-gray-400">({company.profile.full_name})</span>
                    )}
                  </div>
                )}
                {job.category?.name && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Tag size={14} className="text-gray-400" />
                    {job.category.name}
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
    </div>
  )
}
