'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonCardList } from '@/components/ui/Skeleton'
import { DisputeCard } from '@/components/shared/DisputeCard'
import { DisputeModal } from '@/components/shared/DisputeModal'
import {
  getAdminDisputes,
  updateDisputeStatus,
  resolveDispute,
} from '@/lib/actions/disputes'
import type { DisputeFull } from '@/lib/actions/types'
import type { DisputeStatus } from '@/types/database'
import { toast } from 'sonner'

const STATUS_FILTERS = [
  { value: 'all', label: 'Todas' },
  { value: 'new', label: 'Nuevas' },
  { value: 'under_review', label: 'En revisión' },
  { value: 'waiting_company', label: 'Esperando empresa' },
  { value: 'waiting_installer', label: 'Esperando instalador' },
  { value: 'resolved', label: 'Resueltas' },
  { value: 'closed', label: 'Cerradas' },
]

export default function AdminDisputasPage() {
  const [disputes, setDisputes] = useState<DisputeFull[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [isActioning, setIsActioning] = useState(false)
  const [resolveModal, setResolveModal] = useState<{
    isOpen: boolean
    disputeId: string
  } | null>(null)

  const loadDisputes = async () => {
    setIsLoading(true)
    try {
      const data = await getAdminDisputes()
      setDisputes(data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDisputes()
  }, [])

  const filteredDisputes =
    filter === 'all'
      ? disputes
      : disputes.filter((d) => d.status === filter)

  const handleUpdateStatus = async (
    disputeId: string,
    newStatus: DisputeStatus
  ) => {
    setIsActioning(true)
    const res = await updateDisputeStatus(disputeId, newStatus)
    if (res.success) {
      toast.success(res.message)
      loadDisputes()
    } else {
      toast.error(res.error)
    }
    setIsActioning(false)
  }

  const handleResolve = async (resolution: string, adminNotes: string) => {
    if (!resolveModal) return
    const res = await resolveDispute(resolveModal.disputeId, resolution, adminNotes)
    if (res.success) {
      toast.success(res.message)
      loadDisputes()
    } else {
      toast.error(res.error)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Disputas"
        description="Gestioná las disputas entre empresas e instaladores"
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
                ({disputes.filter((d) => d.status === f.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lista */}
      {isLoading ? (
        <SkeletonCardList count={3} />
      ) : filteredDisputes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <EmptyState
            icon={AlertTriangle}
            title="No hay disputas"
            description={
              filter !== 'all'
                ? 'No hay disputas con este filtro.'
                : 'Cuando una empresa o instalador abra una disputa, aparecerá acá para que la medies.'
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDisputes.map((dispute) => (
            <DisputeCard
              key={dispute.id}
              dispute={dispute}
              viewAs="admin"
              onUpdateStatus={handleUpdateStatus}
              onResolve={(id) =>
                setResolveModal({ isOpen: true, disputeId: id })
              }
              isActioning={isActioning}
            />
          ))}
        </div>
      )}

      {/* Modal resolver */}
      {resolveModal && (
        <DisputeModal
          isOpen={resolveModal.isOpen}
          onClose={() => setResolveModal(null)}
          onSubmit={handleResolve}
          mode="resolve"
        />
      )}
    </div>
  )
}
