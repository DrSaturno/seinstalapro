'use client'

import { useEffect, useState } from 'react'
import { Wrench, Search, Star } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { InstallerStatusBadge } from '@/components/admin/InstallerStatusBadge'
import { StatusActionModal } from '@/components/admin/StatusActionModal'
import { getAdminInstallers, updateInstallerStatus } from '@/lib/actions/admin'
import { formatDate } from '@/lib/utils/format'
import { toast } from 'sonner'
import type { Installer, Profile, InstallerStatus } from '@/types/database'

type InstallerWithProfile = Installer & { profile?: Profile }

const STATUS_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'pending_review', label: 'Pendientes' },
  { value: 'approved', label: 'Aprobados' },
  { value: 'changes_requested', label: 'Cambios solicitados' },
  { value: 'rejected', label: 'Rechazados' },
  { value: 'suspended', label: 'Suspendidos' },
]

export default function AdminInstaladoresPage() {
  const [installers, setInstallers] = useState<InstallerWithProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [modal, setModal] = useState<{
    isOpen: boolean
    installerId: string
    action: InstallerStatus
    title: string
    description: string
    confirmLabel: string
    confirmVariant: 'primary' | 'danger'
    requireReason: boolean
  } | null>(null)

  const loadInstallers = async () => {
    setIsLoading(true)
    try {
      const data = await getAdminInstallers(filter)
      setInstallers(data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadInstallers()
  }, [filter])

  const filteredInstallers = installers.filter((i) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      i.profile?.full_name?.toLowerCase().includes(term) ||
      i.profile?.email?.toLowerCase().includes(term) ||
      i.bio?.toLowerCase().includes(term)
    )
  })

  const openModal = (
    installerId: string,
    action: InstallerStatus,
    title: string,
    description: string,
    confirmLabel: string,
    confirmVariant: 'primary' | 'danger' = 'primary',
    requireReason = false
  ) => {
    setModal({
      isOpen: true,
      installerId,
      action,
      title,
      description,
      confirmLabel,
      confirmVariant,
      requireReason,
    })
  }

  const handleAction = async (reason: string) => {
    if (!modal) return
    const result = await updateInstallerStatus(modal.installerId, modal.action, reason)
    if (result.success) {
      toast.success(result.message)
      loadInstallers()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Gestión de Instaladores"
        description="Revisá y aprobá los perfiles de instaladores"
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
            placeholder="Buscar instalador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Tabla */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : filteredInstallers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Wrench size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No se encontraron instaladores.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Instalador</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Contacto</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Experiencia</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Rating</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInstallers.map((installer) => (
                  <tr key={installer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {installer.profile?.full_name || 'Sin nombre'}
                        </p>
                        {installer.bio && (
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">{installer.bio}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-500">{installer.profile?.email}</p>
                      {installer.profile?.phone && (
                        <p className="text-xs text-gray-500">{installer.profile.phone}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {installer.years_of_experience
                        ? `${installer.years_of_experience} años`
                        : 'No indicada'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-gray-700">
                          {installer.avg_rating?.toFixed(1) || '-'}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({installer.total_reviews || 0})
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <InstallerStatusBadge status={installer.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {formatDate(installer.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-1 justify-end flex-wrap">
                        {installer.status === 'pending_review' && (
                          <>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() =>
                                openModal(
                                  installer.id,
                                  'approved',
                                  'Aprobar instalador',
                                  `Vas a aprobar a "${installer.profile?.full_name}". Podrá recibir y ofertar trabajos.`,
                                  'Aprobar'
                                )
                              }
                            >
                              Aprobar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                openModal(
                                  installer.id,
                                  'changes_requested',
                                  'Solicitar cambios',
                                  `Vas a solicitar cambios a "${installer.profile?.full_name}".`,
                                  'Solicitar',
                                  'primary',
                                  true
                                )
                              }
                            >
                              Cambios
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() =>
                                openModal(
                                  installer.id,
                                  'rejected',
                                  'Rechazar instalador',
                                  `Vas a rechazar a "${installer.profile?.full_name}".`,
                                  'Rechazar',
                                  'danger',
                                  true
                                )
                              }
                            >
                              Rechazar
                            </Button>
                          </>
                        )}
                        {installer.status === 'approved' && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() =>
                              openModal(
                                installer.id,
                                'suspended',
                                'Suspender instalador',
                                `Vas a suspender a "${installer.profile?.full_name}".`,
                                'Suspender',
                                'danger',
                                true
                              )
                            }
                          >
                            Suspender
                          </Button>
                        )}
                        {installer.status === 'suspended' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() =>
                              openModal(
                                installer.id,
                                'approved',
                                'Reactivar instalador',
                                `Vas a reactivar a "${installer.profile?.full_name}".`,
                                'Reactivar'
                              )
                            }
                          >
                            Reactivar
                          </Button>
                        )}
                        {(installer.status === 'rejected' || installer.status === 'changes_requested') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              openModal(
                                installer.id,
                                'pending_review',
                                'Reenviar a revisión',
                                `"${installer.profile?.full_name}" volverá a pendiente de revisión.`,
                                'Reenviar'
                              )
                            }
                          >
                            Reenviar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
