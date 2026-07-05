'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Briefcase, List, Columns } from 'lucide-react'
import { clsx } from 'clsx'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { JobCard } from '@/components/empresa/JobCard'
import { getCompanyJobs } from '@/lib/actions/jobs'
import { groupJobsForPipeline, PIPELINE_COLUMNS } from '@/lib/utils/pipeline'
import type { JobWithCompany } from '@/types/database'

const STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'draft', label: 'Borradores' },
  { value: 'published', label: 'Abiertos al equipo' },
  { value: 'assigned', label: 'Asignados' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'approved', label: 'Finalizados' },
  { value: 'cancelled', label: 'Cancelados' },
]

export default function EmpresaTrabajosPage() {
  const [jobs, setJobs] = useState<JobWithCompany[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [view, setView] = useState<'list' | 'board'>('list')

  useEffect(() => {
    async function loadJobs() {
      setIsLoading(true)
      try {
        // El tablero agrupa todos los estados: siempre carga sin filtro
        const data = await getCompanyJobs(view === 'board' ? 'all' : statusFilter)
        setJobs(data)
      } catch (err) {
        console.error('Error cargando trabajos:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadJobs()
  }, [statusFilter, view])

  const pipeline = useMemo(() => groupJobsForPipeline(jobs), [jobs])

  return (
    <div className={clsx('p-6 mx-auto', view === 'board' ? 'max-w-7xl' : 'max-w-5xl')}>
      <PageHeader
        title="Mis Trabajos"
        description="Gestioná tus trabajos de instalación gráfica"
        actions={
          <Link href="/empresa/trabajos/nuevo">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Publicar trabajo
            </Button>
          </Link>
        }
      />

      {/* Toggle vista + filtros */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        {view === 'list' ? (
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  statusFilter === filter.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 font-medium">
            Todo tu circuito de trabajo de un vistazo
          </p>
        )}

        <div className="flex rounded-xl border border-slate-200 overflow-hidden shrink-0">
          <button
            onClick={() => setView('list')}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold transition-colors',
              view === 'list'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-slate-500 hover:bg-slate-50'
            )}
          >
            <List size={15} />
            Lista
          </button>
          <button
            onClick={() => setView('board')}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold transition-colors',
              view === 'board'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-slate-500 hover:bg-slate-50'
            )}
          >
            <Columns size={15} />
            Tablero
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="spinner border-primary-500" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <EmptyState
            icon={Briefcase}
            title={
              statusFilter === 'all' || view === 'board'
                ? 'No tenés trabajos cargados'
                : 'No hay trabajos con este estado'
            }
            description="Cargá tu primer trabajo de instalación gráfica y asignalo a tu equipo."
            actionLabel="Publicar trabajo"
            actionHref="/empresa/trabajos/nuevo"
          />
        </div>
      ) : view === 'list' ? (
        <div className="space-y-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        /* Tablero pipeline */
        <div className="overflow-x-auto pb-4 -mx-2 px-2">
          <div className="flex gap-4 min-w-[900px]">
            {PIPELINE_COLUMNS.map((column) => {
              const columnJobs = pipeline[column.key]
              return (
                <div key={column.key} className="flex-1 min-w-[150px]">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <span className={clsx('w-2 h-2 rounded-full', column.colorClass)} />
                    <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      {column.label}
                    </h3>
                    <span className="text-xs font-bold text-slate-400 ml-auto">
                      {columnJobs.length}
                    </span>
                  </div>
                  <div className="space-y-2 bg-slate-50/60 border border-slate-100 rounded-2xl p-2 min-h-[120px]">
                    {columnJobs.map((job) => (
                      <Link
                        key={job.id}
                        href={`/empresa/trabajos/${job.id}`}
                        className="block bg-white rounded-xl border border-slate-100 p-3 shadow-sm hover:border-primary-200 hover:shadow-md transition-all"
                      >
                        <p className="text-xs font-bold text-slate-700 line-clamp-2">
                          {job.title}
                        </p>
                        {(job as any).category?.name && (
                          <p className="text-[10px] text-slate-400 font-semibold mt-1 uppercase tracking-wide">
                            {(job as any).category.name}
                          </p>
                        )}
                      </Link>
                    ))}
                    {columnJobs.length === 0 && (
                      <p className="text-[11px] text-slate-300 text-center py-4 font-medium">
                        Sin trabajos
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
