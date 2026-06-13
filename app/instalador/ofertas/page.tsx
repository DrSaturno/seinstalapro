'use client'

import { useEffect, useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonCardList } from '@/components/ui/Skeleton'
import { OfferCard } from '@/components/instalador/OfferCard'
import { getInstallerOffers, withdrawOffer } from '@/lib/actions/offers'
import { toast } from 'sonner'
import type { Offer, Job, Company, Category } from '@/types/database'

type OfferWithJob = Offer & {
  job?: Job & { company?: Company; category?: Category }
}

const STATUS_FILTERS = [
  { value: 'all', label: 'Todas' },
  { value: 'sent', label: 'Enviadas' },
  { value: 'shortlisted', label: 'Preseleccionadas' },
  { value: 'accepted', label: 'Aceptadas' },
  { value: 'rejected', label: 'Rechazadas' },
  { value: 'withdrawn', label: 'Retiradas' },
]

export default function InstaladorOfertasPage() {
  const [offers, setOffers] = useState<OfferWithJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const loadOffers = async () => {
    setIsLoading(true)
    try {
      const data = await getInstallerOffers()
      setOffers(data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOffers()
  }, [])

  const filteredOffers =
    filter === 'all'
      ? offers
      : offers.filter((o) => o.status === filter)

  const handleWithdraw = async (offerId: string) => {
    setWithdrawingId(offerId)
    const result = await withdrawOffer(offerId)
    if (result.success) {
      toast.success('Oferta retirada')
      loadOffers()
    } else {
      toast.error(result.error || 'Error')
    }
    setWithdrawingId(null)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Mis Ofertas"
        description="Seguí el estado de todas tus ofertas enviadas"
      />

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
            {f.value !== 'all' && (
              <span className="ml-1 text-xs opacity-75">
                ({offers.filter((o) =>
                  f.value === 'all' ? true : o.status === f.value
                ).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lista */}
      {isLoading ? (
        <SkeletonCardList count={3} />
      ) : filteredOffers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <EmptyState
            icon={ClipboardList}
            title="No tenés ofertas"
            description={
              filter !== 'all'
                ? 'No hay ofertas con este filtro.'
                : 'Buscá trabajos disponibles y enviá tu primera oferta.'
            }
            actionLabel={filter === 'all' ? 'Buscar trabajos' : undefined}
            actionHref={filter === 'all' ? '/instalador/trabajos' : undefined}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOffers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              onWithdraw={handleWithdraw}
              isWithdrawing={withdrawingId === offer.id}
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
