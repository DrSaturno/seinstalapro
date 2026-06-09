'use client'

import { clsx } from 'clsx'
import { AlertTriangle, Calendar, MessageSquare, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatRelativeDate } from '@/lib/utils/format'
import type { DisputeStatus } from '@/types/database'
import type { DisputeFull } from '@/lib/actions/disputes'

const DISPUTE_STATUS: Record<DisputeStatus, { label: string; color: string; bgColor: string }> = {
  new: { label: 'Nueva', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  under_review: { label: 'En revisión', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  waiting_company: { label: 'Esperando empresa', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  waiting_installer: { label: 'Esperando instalador', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  resolved: { label: 'Resuelta', color: 'text-green-700', bgColor: 'bg-green-100' },
  closed: { label: 'Cerrada', color: 'text-gray-600', bgColor: 'bg-gray-100' },
}

interface DisputeCardProps {
  dispute: DisputeFull
  viewAs: 'user' | 'admin'
  onUpdateStatus?: (disputeId: string, newStatus: DisputeStatus) => void
  onResolve?: (disputeId: string) => void
  isActioning?: boolean
}

export function DisputeCard({
  dispute,
  viewAs,
  onUpdateStatus,
  onResolve,
  isActioning,
}: DisputeCardProps) {
  const statusConfig = DISPUTE_STATUS[dispute.status as DisputeStatus]
  const agreement = dispute.agreement as any
  const reporter = dispute.reporter as any

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-orange-500 flex-shrink-0" />
            <h3 className="font-semibold text-gray-900 line-clamp-1">
              {dispute.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {agreement?.job?.title && (
              <span className="line-clamp-1">Trabajo: {agreement.job.title}</span>
            )}
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

      {/* Descripción */}
      {dispute.description && (
        <div className="flex gap-2 mb-3 p-3 bg-gray-50 rounded-lg">
          <MessageSquare size={14} className="text-gray-400 shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600">{dispute.description}</p>
        </div>
      )}

      {/* Info del reportador (solo admin) */}
      {viewAs === 'admin' && reporter && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <User size={14} />
          <span>Reportada por: {reporter.full_name || reporter.email}</span>
        </div>
      )}

      {/* Partes involucradas (solo admin) */}
      {viewAs === 'admin' && agreement && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
          {agreement.company?.company_name && (
            <span>Empresa: {agreement.company.company_name}</span>
          )}
          {agreement.installer?.profile?.full_name && (
            <span>Instalador: {agreement.installer.profile.full_name}</span>
          )}
        </div>
      )}

      {/* Resolución */}
      {dispute.resolution && (
        <div className="p-3 bg-green-50 rounded-lg mb-3">
          <p className="text-xs font-medium text-green-700 mb-1">Resolución:</p>
          <p className="text-sm text-green-800">{dispute.resolution}</p>
        </div>
      )}

      {/* Notas admin */}
      {viewAs === 'admin' && dispute.admin_notes && (
        <div className="p-3 bg-yellow-50 rounded-lg mb-3">
          <p className="text-xs font-medium text-yellow-700 mb-1">Notas del admin:</p>
          <p className="text-sm text-yellow-800">{dispute.admin_notes}</p>
        </div>
      )}

      {/* Footer: acciones */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">
          <Calendar size={12} className="inline mr-1" />
          {formatRelativeDate(dispute.created_at)}
        </span>

        {viewAs === 'admin' && !['resolved', 'closed'].includes(dispute.status) && (
          <div className="flex gap-2">
            {dispute.status === 'new' && onUpdateStatus && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => onUpdateStatus(dispute.id, 'under_review')}
                disabled={isActioning}
              >
                Tomar caso
              </Button>
            )}
            {dispute.status === 'under_review' && (
              <>
                {onUpdateStatus && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUpdateStatus(dispute.id, 'waiting_company')}
                    disabled={isActioning}
                  >
                    Pedir info empresa
                  </Button>
                )}
                {onResolve && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => onResolve(dispute.id)}
                    disabled={isActioning}
                  >
                    Resolver
                  </Button>
                )}
              </>
            )}
            {['waiting_company', 'waiting_installer'].includes(dispute.status) && (
              <>
                {onUpdateStatus && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUpdateStatus(dispute.id, 'under_review')}
                    disabled={isActioning}
                  >
                    Volver a revisión
                  </Button>
                )}
                {onResolve && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => onResolve(dispute.id)}
                    disabled={isActioning}
                  >
                    Resolver
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
