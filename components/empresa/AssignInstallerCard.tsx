'use client'

// Asignación directa de un trabajo a un instalador del equipo,
// o publicación al equipo para que cualquiera lo tome.
// Reemplaza al flujo de ofertas del marketplace.

import { useEffect, useState } from 'react'
import { UserCheck, Megaphone } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import {
  getAssignableInstallers,
  createAssignment,
  publishJobToTeam,
} from '@/lib/actions/assignments'
import type { AssignableInstaller } from '@/lib/actions/types'
import { toast } from 'sonner'

interface AssignInstallerCardProps {
  jobId: string
  jobStatus: string
  onChanged: () => void | Promise<void>
}

export function AssignInstallerCard({
  jobId,
  jobStatus,
  onChanged,
}: AssignInstallerCardProps) {
  const [installers, setInstallers] = useState<AssignableInstaller[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isAssigning, setIsAssigning] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const data = await getAssignableInstallers()
        setInstallers(data)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const handleAssign = async () => {
    if (!selectedId) {
      toast.error('Elegí un instalador de tu equipo')
      return
    }
    setIsAssigning(true)
    try {
      const result = await createAssignment(jobId, selectedId)
      if (result.success) {
        toast.success(result.message)
        await onChanged()
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error('Error inesperado. Intentá de nuevo.')
    } finally {
      setIsAssigning(false)
    }
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      const result = await publishJobToTeam(jobId)
      if (result.success) {
        toast.success(result.message)
        await onChanged()
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error('Error inesperado. Intentá de nuevo.')
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">
        Asignar instalador
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Elegí a alguien de tu equipo, o publicá el trabajo para que cualquier
        miembro lo tome.
      </p>

      {isLoading ? (
        <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
      ) : installers.length === 0 ? (
        <p className="text-sm text-gray-500">
          Todavía no tenés instaladores en tu equipo.{' '}
          <Link href="/empresa/equipo" className="text-primary-600 hover:underline">
            Invitá a tu primer instalador
          </Link>
          .
        </p>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            >
              <option value="">Elegir instalador del equipo...</option>
              {installers.map((installer) => (
                <option key={installer.id} value={installer.id}>
                  {(installer as any).profile?.full_name || 'Instalador'}
                  {installer.total_reviews > 0
                    ? ` · ★ ${Number(installer.avg_rating).toFixed(1)}`
                    : ''}
                </option>
              ))}
            </select>
            <Button onClick={handleAssign} isLoading={isAssigning}>
              <UserCheck className="h-4 w-4 mr-1.5" />
              Asignar
            </Button>
          </div>

          {jobStatus !== 'published' && (
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                ¿Preferís que lo tome el primero disponible?
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePublish}
                isLoading={isPublishing}
              >
                <Megaphone className="h-4 w-4 mr-1.5" />
                Abrir al equipo
              </Button>
            </div>
          )}

          {jobStatus === 'published' && (
            <p className="text-xs text-blue-600 pt-3 border-t border-gray-100">
              Este trabajo está abierto: cualquier instalador de tu equipo puede
              tomarlo. También podés asignarlo directo arriba.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
