'use client'

import { useEffect, useState } from 'react'
import { ClipboardList, ChevronDown, ChevronUp, Briefcase } from 'lucide-react'
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
import type { OfferWithInstaller } from '@/lib/actions/types'
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
  const [expandedOffer, setExpandedOffer] = useState<string | null>(null)
  const [collapsedJobs, setCollapsedJobs] = useState<Set<string>>(new Set())

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

  // Agrupar ofertas por trabajo
  const offersByJob = filteredOffers.reduce<
    Record<string, { jobTitle: string; jobId: string; categoryName?: string; offers: OfferWithInstaller[] }>
  >((acc, offer) => {
    const job = (offer as any).job
    const jobId = offer.job_id
    const jobTitle = job?.title || 'Trabajo sin titulo'
    const categoryName = job?.category?.name

    if (!acc[jobId]) {
      acc[jobId] = { jobTitle, jobId, categoryName, offers: [] }
    }
    acc[jobId].offers.push(offer)
    return acc
  }, {})

  const jobGroups = Object.values(offersByJob)

  const toggleJobCollapse = (jobId: string) => {
    setCollapsedJobs(prev => {
      const next = new Set(prev)
      if (next.has(jobId)) {
        next.delete(jobId)
      } else {
        next.add(jobId)
      }
      return next
    })
  }

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
        description="Revisa y gestiona las ofertas de los instaladores, agrupadas por trabajo"
      />

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap mb-6">
        {STATUS_FILTERS.map((f) => {
          const count = f.value === 'all'
            ? offers.length
            : offers.filter((o) => o.status === f.value).length
          return (
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
              <span className="ml-1 text-xs opacity-75">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Lista agrupada por trabajo */}
      {isLoading ? (
        <SkeletonCardList count={3} />
      ) : filteredOffers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <EmptyState
            icon={ClipboardList}
            title="No tenes ofertas"
            description={
              filter !== 'all'
                ? 'No hay ofertas con este filtro.'
                : 'Cuando los instaladores envien ofertas a tus trabajos publicados, apareceran aca.'
            }
            actionLabel={filter === 'all' ? 'Ver mis trabajos' : undefined}
            actionHref={filter === 'all' ? '/empresa/trabajos' : undefined}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {jobGroups.map((group) => {
            const isCollapsed = collapsedJobs.has(group.jobId)
            const newCount = group.offers.filter(o => o.status === 'sent').length

            return (
              <div
                key={group.jobId}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                {/* Header del grupo */}
                <button
                  onClick={() => toggleJobCollapse(group.jobId)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary-50">
                      <Briefcase size={18} className="text-primary-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">
                        {group.jobTitle}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {group.categoryName && `${group.categoryName} · `}
                        {group.offers.length} oferta{group.offers.length !== 1 ? 's' : ''}
                        {newCount > 0 && (
                          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                            {newCount} nueva{newCount !== 1 ? 's' : ''}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  {isCollapsed ? (
                    <ChevronDown size={20} className="text-gray-400" />
                  ) : (
                    <ChevronUp size={20} className="text-gray-400" />
                  )}
                </button>

                {/* Ofertas del grupo */}
                {!isCollapsed && (
                  <div className="border-t border-gray-100 p-4 space-y-3">
                    {group.offers.map((offer) => (
                      <ReceivedOfferCard
                        key={offer.id}
                        offer={offer}
                        onShortlist={handleShortlist}
                        onAccept={handleAccept}
                        onReject={handleReject}
                        isActioning={actioningId === offer.id}
                        isExpanded={expandedOffer === offer.id}
                        onToggleExpand={() =>
                          setExpandedOffer(
                            expandedOffer === offer.id ? null : offer.id
                          )
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
