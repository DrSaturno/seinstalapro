'use client'

import { useEffect, useState } from 'react'
import { Briefcase, MapPin, Building2, Hand, ClipboardList } from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonCardList } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { getClaimableJobs, claimJob } from '@/lib/actions/assignments'
import { getInstallerAgreements } from '@/lib/actions/agreements'
import type { AgreementFull } from '@/lib/actions/types'
import { AGREEMENT_STATUS } from '@/lib/utils/status'
import { formatRelativeDate } from '@/lib/utils/format'
import { toast } from 'sonner'

export default function MisTrabajosPage() {
  const [claimable, setClaimable] = useState<any[]>([])
  const [agreements, setAgreements] = useState<AgreementFull[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [claimingId, setClaimingId] = useState<string | null>(null)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [claimableJobs, myAgreements] = await Promise.all([
        getClaimableJobs(),
        getInstallerAgreements(),
      ])
      setClaimable(claimableJobs)
      setAgreements(myAgreements)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleClaim = async (jobId: string, title: string) => {
    if (!confirm(`¿Tomar el trabajo "${title}"? Vas a quedar como responsable.`)) return
    setClaimingId(jobId)
    try {
      const result = await claimJob(jobId)
      if (result.success) {
        toast.success(result.message)
        loadData()
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error('Error inesperado. Intentá de nuevo.')
    } finally {
      setClaimingId(null)
    }
  }

  const activeAgreements = agreements.filter((a) =>
    ['active', 'coordinating', 'confirmed', 'in_progress'].includes(a.status)
  )

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Mis trabajos"
        description="Trabajos asignados y disponibles en tus equipos"
      />

      {isLoading ? (
        <SkeletonCardList count={3} />
      ) : (
        <div className="space-y-8">
          {/* Disponibles para tomar */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Disponibles para tomar ({claimable.length})
            </h2>
            {claimable.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-sm text-gray-500">
                No hay trabajos abiertos en tus equipos ahora mismo.
              </div>
            ) : (
              <div className="space-y-3">
                {claimable.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{job.title}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Building2 size={12} />
                          {job.company?.company_name}
                        </span>
                        {job.category?.name && (
                          <Badge variant="info">{job.category.name}</Badge>
                        )}
                        {job.location?.city_name && (
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {job.location.city_name}
                          </span>
                        )}
                        {job.published_at && (
                          <span>Publicado {formatRelativeDate(job.published_at)}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      isLoading={claimingId === job.id}
                      onClick={() => handleClaim(job.id, job.title)}
                    >
                      <Hand className="h-4 w-4 mr-1.5" />
                      Tomar trabajo
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Asignados / en curso */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              En curso ({activeAgreements.length})
            </h2>
            {activeAgreements.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No tenés trabajos en curso"
                description="Cuando una empresa te asigne un trabajo, o tomes uno disponible, va a aparecer acá."
              />
            ) : (
              <div className="space-y-3">
                {activeAgreements.map((agreement) => {
                  const statusConfig = AGREEMENT_STATUS[agreement.status]
                  return (
                    <Link
                      key={agreement.id}
                      href="/instalador/acuerdos"
                      className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-primary-200 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {agreement.job?.title || 'Trabajo'}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Building2 size={12} />
                              {(agreement as any).company?.company_name}
                            </span>
                            <span>Asignado {formatRelativeDate(agreement.created_at)}</span>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
              <ClipboardList size={12} />
              Gestioná los estados desde{' '}
              <Link href="/instalador/acuerdos" className="text-primary-600 hover:underline">
                Mis acuerdos
              </Link>
            </p>
          </section>
        </div>
      )}
    </div>
  )
}
