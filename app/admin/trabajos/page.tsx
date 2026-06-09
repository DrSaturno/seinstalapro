'use client'

import { useEffect, useState } from 'react'
import { Briefcase, Search, CheckCircle, XCircle } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { StatusActionModal } from '@/components/admin/StatusActionModal'
import { getAdminJobs, updateJobStatus } from '@/lib/actions/admin'
import { formatDate, formatCurrency } from '@/lib/utils/format'
import { JOB_STATUS } from '@/lib/utils/status'
import { toast } from 'sonner'
import { clsx } from 'clsx'
import type { Job, Company, JobStatus } from '@/types/database'

type JobWithDetails = Job & {
  company?: Company & { profile?: { full_name: string; email: string } }
  category?: { name: string }
}

const STATUS_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'pending_admin_approval', label: 'Por moderar' },
  { value: 'published', label: 'Publicados' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'draft', label: 'Borradores' },
  { value: 'cancelled', label: 'Cancelados' },
]

export default function AdminTrabajosPage() {
  const [jobs, setJobs] = useState<JobWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [modal, setModal] = useState<{
    isOpen: boolean
    jobId: string
    action: 'published' | 'draft'
    title: string
    description: string
    confirmLabel: string
    confirmVariant: 'primary' | 'danger'
    requireReason: boolean
  } | null>(null)

  const loadJobs = async () => {
    setIsLoading(true)
    try {
      const data = await getAdminJobs(filter)
      setJobs(data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadJobs()
  }, [filter])

  const filteredJobs = jobs.filter((j) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      j.title?.toLowerCase().includes(term) ||
      (j.company as any)?.company_name?.toLowerCase().includes(term) ||
      j.category?.name?.toLowerCase().includes(term)
    )
  })

  const handleAction = async (reason: string) => {
    if (!modal) return
    const result = await updateJobStatus(modal.jobId, modal.action, reason)
    if (result.success) {
      toast.success(result.message)
      loadJobs()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Moderación de Trabajos"
        description="Revisá y aprobá los trabajos publicados por empresas"
      />

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-2 flex-wrap">
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
        <div className="relative flex-1 max-w-xs ml-auto">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar trabajo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Lista de trabajos */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No se encontraron trabajos.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((job) => {
            const statusConfig = JOB_STATUS[job.status as JobStatus]
            const company = job.company as any
            return (
              <div
                key={job.id}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Info principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {job.title}
                      </h3>
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

                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      {company?.company_name && (
                        <span>Empresa: {company.company_name}</span>
                      )}
                      {job.category?.name && (
                        <span>Categoría: {job.category.name}</span>
                      )}
                      {(job.budget_min || job.budget_max) && (
                        <span>
                          Presupuesto:{' '}
                          {job.budget_min && job.budget_max
                            ? `${formatCurrency(job.budget_min, job.currency)} - ${formatCurrency(job.budget_max, job.currency)}`
                            : job.budget_min
                            ? `Desde ${formatCurrency(job.budget_min, job.currency)}`
                            : `Hasta ${formatCurrency(job.budget_max!, job.currency)}`}
                        </span>
                      )}
                      <span>Creado: {formatDate(job.created_at)}</span>
                    </div>
                  </div>

                  {/* Acciones */}
                  {job.status === 'pending_admin_approval' && (
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() =>
                          setModal({
                            isOpen: true,
                            jobId: job.id,
                            action: 'published',
                            title: 'Aprobar trabajo',
                            description: `Vas a aprobar "${job.title}". Será visible para los instaladores.`,
                            confirmLabel: 'Aprobar y publicar',
                            confirmVariant: 'primary',
                            requireReason: false,
                          })
                        }
                      >
                        <CheckCircle size={14} className="mr-1" />
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() =>
                          setModal({
                            isOpen: true,
                            jobId: job.id,
                            action: 'draft',
                            title: 'Rechazar trabajo',
                            description: `Vas a rechazar "${job.title}". Volverá a borrador para la empresa.`,
                            confirmLabel: 'Rechazar',
                            confirmVariant: 'danger',
                            requireReason: true,
                          })
                        }
                      >
                        <XCircle size={14} className="mr-1" />
                        Rechazar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <StatusActionModal
          isOpen={modal.isOpen}
          onClose={() => setModal(null)}
          onConfirm={handleAction}
          title={modal.title}
          description={modal.description}
          confirmLabel={modal.confirmLabel}
          confirmVariant={modal.confirmVariant}
          requireReason={modal.requireReason}
        />
      )}
    </div>
  )
}
