'use client'

import { useEffect, useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonCardList } from '@/components/ui/Skeleton'
import { ReceivedOfferCard } from '@/components/empresa/ReceivedOfferCard'
import {
  getCompanyReceivedOffers,
  shortlistOffer,
  acceptOffer,
  rejectOffer,
} from '@/lib/actions/company-offers'
import type { OfferWithInstaller } from '@/lib/actions/company-offers'
import { toast } from 'sonner'

const STATUS_FILTERS = [
  { value: 'all', label: 'Todas' },
  { value: 'sent', label: 'Nuevas' },
  { value: 'shortlisted', label: 'Preseleccionadas' },
  { value: 'accepted', label: 'Aceptadas' },
  { value: 'rejected', label: 'Rechazadas' },
]

export default function EmpresaOfertasPage() {
  const [offers, setOffers] = useState<OfferWithInstaller[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [actioningId, setActioningId] = useState<string | null>(null)

  const loadOffers = async () => {
    setIsLoading(true)
    try {
      const data = await getCompanyReceivedOffers()
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
    filter === 'all' ? offers : offers.filter((o) => o.status === filter)

  const handleShortlist = async (offerId: string) => {
    setActioningId(offerId)
    const res = await shortlistOffer(offerId)
    if (res.success) {
      toast.success(res.message)
      loadOffers()
    } else {
      toast.error(res.error)
    }
    setActioningId(null)
  }

  const handleAccept = async (offerId: string) => {
    setActioningId(offerId)
    const res = await acceptOffer(offerId)
    if (res.success) {
      toast.success(res.message)
      loadOffers()
    } else {
      toast.error(res.error)
    }
    setActioningId(null)
  }

  const handleReject = async (offerId: string) => {
    setActioningId(offerId)
    const res = await rejectOffer(offerId)
    if (res.success) {
      toast.success(res.message)
      loadOffers()
    } else {
      toast.error(res.error)
    }
    setActioningId(null)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Ofertas Recibidas"
        description="Revisá y gestioná las ofertas de los instaladores"
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
                ({offers.filter((o) => o.status === f.value).length})
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
                : 'Cuando los instaladores envíen ofertas a tus trabajos publicados, aparecerán acá.'
            }
            actionLabel={filter === 'all' ? 'Ver mis trabajos' : undefined}
            actionHref={filter === 'all' ? '/empresa/trabajos' : undefined}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOffers.map((offer) => (
            <ReceivedOfferCard
              key={offer.id}
              offer={offer}
              onShortlist={handleShortlist}
              onAccept={handleAccept}
              onReject={handleReject}
              isActioning={actioningId === offer.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
