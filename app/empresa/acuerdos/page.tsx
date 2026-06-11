'use client'

import { useEffect, useState } from 'react'
import { FileCheck2 } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonCardList } from '@/components/ui/Skeleton'
import { AgreementCard } from '@/components/shared/AgreementCard'
import { ReviewModal } from '@/components/shared/ReviewModal'
import {
  getCompanyAgreements,
  updateAgreementStatus,
  approveCompletedJob,
  createReview,
} from '@/lib/actions/agreements'
import { createDispute } from '@/lib/actions/disputes'
import { DisputeModal } from '@/components/shared/DisputeModal'
import type { AgreementFull } from '@/lib/actions/types'
import type { AgreementStatus } from '@/types/database'
import { toast } from 'sonner'

const STATUS_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'coordinating', label: 'Coordinando' },
  { value: 'confirmed', label: 'Confirmados' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'completed', label: 'Completados' },
]

export default function EmpresaAcuerdosPage() {
  const [agreements, setAgreements] = useState<AgreementFull[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [isActioning, setIsActioning] = useState(false)
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean
    agreementId: string
  } | null>(null)
  const [disputeModal, setDisputeModal] = useState<{
    isOpen: boolean
    agreementId: string
  } | null>(null)

  const loadAgreements = async () => {
    setIsLoading(true)
    try {
      const data = await getCompanyAgreements()
      setAgreements(data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAgreements()
  }, [])

  const filteredAgreements =
    filter === 'all'
      ? agreements
      : agreements.filter((a) => a.status === filter)

  const handleAction = async (
    agreementId: string,
    action: AgreementStatus
  ) => {
    setIsActioning(true)
    const res = await updateAgreementStatus(agreementId, action)
    if (res.success) {
      toast.success(res.message)
      loadAgreements()
    } else {
      toast.error(res.error)
    }
    setIsActioning(false)
  }

  const handleApprove = async (agreementId: string) => {
    setIsActioning(true)
    const res = await approveCompletedJob(agreementId)
    if (res.success) {
      toast.success(res.message)
      loadAgreements()
    } else {
      toast.error(res.error)
    }
    setIsActioning(false)
  }

  const handleReview = async (rating: number, comment: string) => {
    if (!reviewModal) return
    const res = await createReview(reviewModal.agreementId, rating, comment)
    if (res.success) {
      toast.success(res.message)
      loadAgreements()
    } else {
      toast.error(res.error)
    }
  }

  const handleDispute = async (title: string, description: string) => {
    if (!disputeModal) return
    const res = await createDispute(disputeModal.agreementId, title, description)
    if (res.success) {
      toast.success(res.message)
      loadAgreements()
    } else {
      toast.error(res.error)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Acuerdos"
        description="Seguí el progreso de tus instalaciones en curso"
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
          </button>
        ))}
      </div>

      {/* Lista */}
      {isLoading ? (
        <SkeletonCardList count={3} />
      ) : filteredAgreements.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <EmptyState
            icon={FileCheck2}
            title="No tenés acuerdos"
            description={
              filter !== 'all'
                ? 'No hay acuerdos con este filtro.'
                : 'Cuando aceptes una oferta de un instalador, el acuerdo aparecerá acá.'
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAgreements.map((agreement) => (
            <AgreementCard
              key={agreement.id}
              agreement={agreement}
              viewAs="company"
              onAction={handleAction}
              onApprove={handleApprove}
              onReview={(id) =>
                setReviewModal({ isOpen: true, agreementId: id })
              }
              onDispute={(id) =>
                setDisputeModal({ isOpen: true, agreementId: id })
              }
              isActioning={isActioning}
            />
          ))}
        </div>
      )}

      {/* Modal de reseña */}
      {reviewModal && (
        <ReviewModal
          isOpen={reviewModal.isOpen}
          onClose={() => setReviewModal(null)}
          onSubmit={handleReview}
          title="Calificá al instalador"
        />
      )}

      {/* Modal de disputa */}
      {disputeModal && (
        <DisputeModal
          isOpen={disputeModal.isOpen}
          onClose={() => setDisputeModal(null)}
          onSubmit={handleDispute}
          mode="create"
        />
      )}
    </div>
  )
}
