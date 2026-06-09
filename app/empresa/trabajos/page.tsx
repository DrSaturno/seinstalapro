'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Briefcase } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { JobCard } from '@/components/empresa/JobCard'
import { getCompanyJobs } from '@/lib/actions/jobs'
import type { JobWithCompany, JobStatus } from '@/types/database'

const STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'draft', label: 'Borradores' },
  { value: 'pending_admin_approval', label: 'En revisión' },
  { value: 'published', label: 'Publicados' },
  { value: 'receiving_offers', label: 'Recibiendo ofertas' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'approved', label: 'Finalizados' },
  { value: 'cancelled', label: 'Cancelados' },
]

export default function EmpresaTrabajosPage() {
  const [jobs, setJobs] = useState<JobWithCompany[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    async function loadJobs() {
      setIsLoading(true)
      try {
        const data = await getCompanyJobs(statusFilter)
        setJobs(data)
      } catch (err) {
        console.error('Error cargando trabajos:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadJobs()
  }, [statusFilter])

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Mis Trabajos"
        description="Gestioná tus publicaciones de instalación gráfica"
        actions={
          <Link href="/empresa/trabajos/nuevo">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Publicar trabajo
            </Button>
          </Link>
        }
      />

      {/* Filtros de estado */}
      <div className="flex flex-wrap gap-2 mb-6">
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

      {/* Lista */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="spinner border-primary-500" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <EmptyState
            icon={Briefcase}
            title={
              statusFilter === 'all'
                ? 'No tenés trabajos publicados'
                : 'No hay trabajos con este estado'
            }
            description="Publicá tu primer trabajo de instalación gráfica y empezá a recibir ofertas."
            actionLabel="Publicar trabajo"
            actionHref="/empresa/trabajos/nuevo"
          />
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  )
}
