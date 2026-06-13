'use client'

import { clsx } from 'clsx'
import Link from 'next/link'
import {
  DollarSign,
  Calendar,
  Building2,
  Wrench,
  Tag,
  MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AGREEMENT_STATUS } from '@/lib/utils/status'
import { formatCurrency, formatRelativeDate, formatDate } from '@/lib/utils/format'
import type { AgreementStatus } from '@/types/database'
import type { AgreementFull } from '@/lib/actions/types'

interface AgreementCardProps {
  agreement: AgreementFull
  viewAs: 'company' | 'installer'
  onAction?: (agreementId: string, action: AgreementStatus) => void
  onApprove?: (agreementId: string) => void
  onReview?: (agreementId: string) => void
  onDispute?: (agreementId: string) => void
  isActioning?: boolean
}

export function AgreementCard({
  agreement,
  viewAs,
  onAction,
  onApprove,
  onReview,
  onDispute,
  isActioning,
}: AgreementCardProps) {
  const statusConfig = AGREEMENT_STATUS[agreement.status as AgreementStatus]
  const job = agreement.job as any
  const company = agreement.company as any
  const installer = agreement.installer as any
  const offer = agreement.offer as any

  const counterpart =
    viewAs === 'company'
      ? installer?.profile?.full_name || 'Instalador'
      : company?.company_name || company?.profile?.full_name || 'Empresa'

  const CounterpartIcon = viewAs === 'company' ? Wrench : Building2

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 line-clamp-1">
            {job?.title || 'Trabajo'}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
            <CounterpartIcon size={14} />
            <span>{counterpart}</span>
            {job?.category?.name && (
              <>
                <span>·</span>
                <Tag size={12} />
                <span>{job.category.name}</span>
              </>
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

      {/* Info */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm mb-3">
        {agreement.final_price && (
          <div className="flex items-center gap-1.5 text-green-700 font-medium">
            <DollarSign size={14} />
            <span>
              {formatCurrency(agreement.final_price, agreement.currency)}
            </span>
          </div>
        )}

        {agreement.confirmed_start_date && (
          <div className="flex items-center gap-1.5 text-gray-500">
            <Calendar size={14} />
            <span>
              {formatDate(agreement.confirmed_start_date)}
              {agreement.confirmed_end_date
                ? ` — ${formatDate(agreement.confirmed_end_date)}`
                : ''}
            </span>
          </div>
        )}
      </div>

      {/* Notas */}
      {agreement.notes && (
        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mb-3">
          {agreement.notes}
        </p>
      )}

      {/* Acciones */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">
          Creado {formatRelativeDate(agreement.created_at)}
        </span>

        <div className="flex flex-wrap gap-2">
          {/* Mensajes (ambos roles, estados activos) */}
          {!['cancelled'].includes(agreement.status) && (
            <Link
              href={`/${viewAs === 'company' ? 'empresa' : 'instalador'}/mensajes?acuerdo=${agreement.id}`}
            >
              <Button size="sm" variant="outline">
                <MessageSquare size={14} className="mr-1" />
                Mensajes
              </Button>
            </Link>
          )}

          {/* Flujo para empresa */}
          {viewAs === 'company' && (
            <>
              {agreement.status === 'active' && onAction && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => onAction(agreement.id, 'coordinating')}
                  disabled={isActioning}
                >
                  Iniciar coordinación
                </Button>
              )}
              {agreement.status === 'coordinating' && onAction && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => onAction(agreement.id, 'confirmed')}
                  disabled={isActioning}
                >
                  Confirmar fechas
                </Button>
              )}
              {agreement.status === 'completed' && onApprove && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => onApprove(agreement.id)}
                  disabled={isActioning}
                >
                  Aprobar trabajo
                </Button>
              )}
              {['active', 'coordinating', 'confirmed'].includes(agreement.status) && onAction && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onAction(agreement.id, 'cancelled')}
                  disabled={isActioning}
                >
                  Cancelar
                </Button>
              )}
            </>
          )}

          {/* Flujo para instalador */}
          {viewAs === 'installer' && (
            <>
              {agreement.status === 'confirmed' && onAction && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => onAction(agreement.id, 'in_progress')}
                  disabled={isActioning}
                >
                  Iniciar trabajo
                </Button>
              )}
              {agreement.status === 'in_progress' && onAction && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => onAction(agreement.id, 'completed')}
                  disabled={isActioning}
                >
                  Marcar completado
                </Button>
              )}
            </>
          )}

          {/* Reseña (ambos roles, solo si aprobado) */}
          {onReview && ['completed'].includes(agreement.status) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReview(agreement.id)}
              disabled={isActioning}
            >
              Dejar reseña
            </Button>
          )}

          {/* Disputa (ambos roles, estados activos) */}
          {onDispute &&
            ['active', 'coordinating', 'confirmed', 'in_progress', 'completed'].includes(
              agreement.status
            ) && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDispute(agreement.id)}
                disabled={isActioning}
                className="text-red-600 hover:bg-red-50"
              >
                Disputar
              </Button>
            )}
        </div>
      </div>
    </div>
  )
}
