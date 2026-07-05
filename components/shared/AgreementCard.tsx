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
  CheckCircle2,
  Clock,
  AlertTriangle,
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
  onComplete?: (agreementId: string) => void
  onViewEvidence?: (agreementId: string) => void
  onReview?: (agreementId: string) => void
  onDispute?: (agreementId: string) => void
  isActioning?: boolean
}

export function AgreementCard({
  agreement,
  viewAs,
  onAction,
  onApprove,
  onComplete,
  onViewEvidence,
  onReview,
  onDispute,
  isActioning,
}: AgreementCardProps) {
  const statusConfig = AGREEMENT_STATUS[agreement.status as AgreementStatus]
  const job = agreement.job as any
  const company = agreement.company as any
  const installer = agreement.installer as any

  const counterpart =
    viewAs === 'company'
      ? installer?.profile?.full_name || 'Instalador'
      : company?.company_name || company?.profile?.full_name || 'Empresa'

  const CounterpartIcon = viewAs === 'company' ? Wrench : Building2

  // Configuración de la línea de tiempo de progreso
  const steps = [
    { key: 'active', label: 'Aceptado' },
    { key: 'coordinating', label: 'Coordinación' },
    { key: 'confirmed', label: 'Programado' },
    { key: 'in_progress', label: 'En progreso' },
    { key: 'completed', label: 'Completado' },
  ]

  const getStepStatus = (stepKey: string, stepIndex: number) => {
    if (agreement.status === 'cancelled') return 'cancelled'
    
    const statusOrder = ['active', 'coordinating', 'confirmed', 'in_progress', 'completed']
    const currentOrderIndex = statusOrder.indexOf(agreement.status)
    const stepOrderIndex = statusOrder.indexOf(stepKey)

    if (stepOrderIndex < currentOrderIndex) return 'completed'
    if (stepOrderIndex === currentOrderIndex) return 'current'
    return 'pending'
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm shadow-slate-100/40 hover:shadow-md hover:shadow-slate-100/60 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="font-extrabold text-slate-800 text-base line-clamp-1">
            {job?.title || 'Trabajo'}
          </h3>
          <div className="flex items-center gap-2 mt-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <CounterpartIcon size={12} className="text-slate-400" />
            <span>{counterpart}</span>
            {job?.category?.name && (
              <>
                <span>&bull;</span>
                <Tag size={12} className="text-slate-300" />
                <span>{job.category.name}</span>
              </>
            )}
          </div>
        </div>

        {statusConfig && (
          <span
            className={clsx(
              'inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold border',
              agreement.status === 'active' && 'bg-blue-50 text-blue-700 border-blue-100/50',
              agreement.status === 'coordinating' && 'bg-amber-50 text-amber-700 border-amber-100/50',
              agreement.status === 'confirmed' && 'bg-indigo-50 text-indigo-700 border-indigo-100/50',
              agreement.status === 'in_progress' && 'bg-purple-50 text-purple-700 border-purple-100/50',
              agreement.status === 'completed' && 'bg-emerald-50 text-emerald-700 border-emerald-100/50',
              agreement.status === 'cancelled' && 'bg-rose-50 text-rose-700 border-rose-100/50'
            )}
          >
            {statusConfig.label}
          </span>
        )}
      </div>

      {/* Info Financiera y Fechas */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm mb-6 bg-slate-50 border border-slate-100/50 rounded-2xl py-3 px-4 max-w-max">
        {agreement.final_price && (
          <div className="flex items-center gap-1.5 text-emerald-700 font-extrabold">
            <DollarSign size={14} />
            <span>
              {formatCurrency(agreement.final_price, agreement.currency)}
            </span>
          </div>
        )}

        {agreement.confirmed_start_date && (
          <div className="flex items-center gap-1.5 text-slate-500 font-medium text-xs">
            <Calendar size={14} className="text-slate-400" />
            <span>
              {formatDate(agreement.confirmed_start_date)}
              {agreement.confirmed_end_date
                ? ` — ${formatDate(agreement.confirmed_end_date)}`
                : ''}
            </span>
          </div>
        )}
      </div>

      {/* Línea de tiempo de progreso del proyecto (Oculta si está Cancelado) */}
      {agreement.status !== 'cancelled' ? (
        <div className="mb-6 pt-2 pb-4">
          <div className="relative flex items-center justify-between w-full">
            {/* Barra de progreso de fondo */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-100 z-0" />
            
            {/* Nodos de progreso */}
            {steps.map((step, idx) => {
              const stepStatus = getStepStatus(step.key, idx)
              return (
                <div key={step.key} className="flex flex-col items-center relative z-10">
                  {/* Nodo circular */}
                  <div
                    className={clsx(
                      'w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                      stepStatus === 'completed' && 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/10',
                      stepStatus === 'current' && 'bg-primary-600 border-primary-600 text-white ring-4 ring-primary-100/50 animate-pulse',
                      stepStatus === 'pending' && 'bg-white border-slate-200 text-slate-300'
                    )}
                  >
                    {stepStatus === 'completed' ? (
                      <CheckCircle2 size={14} className="stroke-[3px]" />
                    ) : (
                      <span className="text-[10px] font-bold">{idx + 1}</span>
                    )}
                  </div>
                  {/* Etiqueta */}
                  <span
                    className={clsx(
                      'text-[10px] font-bold mt-2 whitespace-nowrap absolute top-7',
                      stepStatus === 'completed' && 'text-emerald-600',
                      stepStatus === 'current' && 'text-primary-600',
                      stepStatus === 'pending' && 'text-slate-400'
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
          {/* Relleno para que no se superpongan las etiquetas absolutas */}
          <div className="h-4" />
        </div>
      ) : (
        <div className="mb-6 flex items-center gap-2 p-3.5 bg-rose-50 border border-rose-100/50 rounded-2xl text-rose-800 text-xs font-semibold">
          <AlertTriangle size={16} />
          <span>Este proyecto ha sido cancelado y no tiene línea de progreso activa.</span>
        </div>
      )}

      {/* Notas */}
      {agreement.notes && (
        <div className="text-xs text-slate-500 bg-slate-50 border border-slate-100/50 p-4.5 rounded-2xl mb-5 leading-relaxed">
          <span className="font-bold text-slate-700 block mb-1">Notas del acuerdo:</span>
          {agreement.notes}
        </div>
      )}

      {/* Acciones */}
      <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-100 gap-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Creado {formatRelativeDate(agreement.created_at)}
        </span>

        <div className="flex flex-wrap gap-2">
          {/* Mensajes (ambos roles, estados activos) */}
          {agreement.status !== 'cancelled' && (
            <Link
              href={`/${viewAs === 'company' ? 'empresa' : 'instalador'}/mensajes?acuerdo=${agreement.id}`}
            >
              <Button size="sm" variant="outline" className="font-bold text-xs rounded-xl">
                <MessageSquare size={13} className="mr-1.5" />
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
                  className="font-bold text-xs rounded-xl"
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
                  className="font-bold text-xs rounded-xl"
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
                  className="font-bold text-xs rounded-xl"
                >
                  Aprobar entrega
                </Button>
              )}
              {['active', 'coordinating', 'confirmed'].includes(agreement.status) && onAction && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onAction(agreement.id, 'cancelled')}
                  disabled={isActioning}
                  className="font-semibold text-xs rounded-xl border border-slate-200"
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
                  className="font-bold text-xs rounded-xl"
                >
                  Iniciar trabajo
                </Button>
              )}
              {agreement.status === 'in_progress' && onComplete && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => onComplete(agreement.id)}
                  disabled={isActioning}
                  className="font-bold text-xs rounded-xl"
                >
                  Entregar con evidencia
                </Button>
              )}
            </>
          )}

          {/* Evidencia de entrega (ambos roles, cuando el trabajo fue entregado) */}
          {onViewEvidence && agreement.status === 'completed' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewEvidence(agreement.id)}
              disabled={isActioning}
              className="font-bold text-xs rounded-xl"
            >
              Ver evidencia
            </Button>
          )}

          {/* Reseña (ambos roles, solo si aprobado) */}
          {onReview && ['completed'].includes(agreement.status) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReview(agreement.id)}
              disabled={isActioning}
              className="font-bold text-xs rounded-xl"
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
                className="text-rose-600 hover:bg-rose-50 font-semibold text-xs rounded-xl border border-rose-100"
              >
                Disputar
              </Button>
            )}
        </div>
      </div>
    </div>
  )
}
