'use client'

import { useEffect, useState } from 'react'
import {
  Wrench,
  Search,
  Star,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Globe,
  ChevronDown,
  ChevronUp,
  Briefcase,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { InstallerStatusBadge } from '@/components/admin/InstallerStatusBadge'
import { StatusActionModal } from '@/components/admin/StatusActionModal'
import { getAdminInstallers, updateInstallerStatus } from '@/lib/actions/admin'
import { formatDate } from '@/lib/utils/format'
import { toast } from 'sonner'
import type { Installer, Profile, InstallerStatus } from '@/types/database'

type InstallerWithProfile = Installer & {
  profile?: Profile
  skills?: Array<{ id: string; skill_name: string }>
}

const STATUS_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'draft', label: 'Borradores' },
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
  const [expandedId, setExpandedId] = useState<string | null>(null)
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

      {/* Lista */}
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
        <div className="space-y-3">
          {filteredInstallers.map((installer) => (
            <InstallerCard
              key={installer.id}
              installer={installer}
              isExpanded={expandedId === installer.id}
              onToggleExpand={() =>
                setExpandedId(expandedId === installer.id ? null : installer.id)
              }
              onAction={openModal}
            />
          ))}
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

function InstallerCard({
  installer,
  isExpanded,
  onToggleExpand,
  onAction,
}: {
  installer: InstallerWithProfile
  isExpanded: boolean
  onToggleExpand: () => void
  onAction: (
    installerId: string,
    action: InstallerStatus,
    title: string,
    description: string,
    confirmLabel: string,
    confirmVariant?: 'primary' | 'danger',
    requireReason?: boolean
  ) => void
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar
              src={installer.profile?.avatar_url}
              fallback={installer.profile?.full_name || 'I'}
              size="lg"
            />
            <div className="min-w-0">
              <p className="font-semibold text-gray-900">
                {installer.profile?.full_name || 'Sin nombre'}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                <span>{installer.profile?.email}</span>
                {installer.avg_rating > 0 && (
                  <>
                    <span className="text-gray-300">|</span>
                    <span className="flex items-center gap-0.5">
                      <Star size={12} className="text-yellow-500 fill-yellow-500" />
                      {installer.avg_rating.toFixed(1)}
                      <span className="text-xs text-gray-400">({installer.total_reviews})</span>
                    </span>
                  </>
                )}
              </div>
              {installer.years_of_experience && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {installer.years_of_experience} años de experiencia
                </p>
              )}
            </div>
          </div>
          <InstallerStatusBadge status={installer.status} />
        </div>

        {/* Info compacta + acciones */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {installer.country === 'AR' ? 'Argentina' : installer.country === 'BR' ? 'Brasil' : installer.country}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatDate(installer.created_at)}
            </span>
          </div>

          <button
            onClick={onToggleExpand}
            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={16} />
                Ocultar
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                Ver detalle
              </>
            )}
          </button>
        </div>
      </div>

      {/* Detalle expandido */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Datos profesionales */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Perfil profesional
              </h4>
              <div className="bg-white rounded-lg p-4 border border-gray-100 space-y-2">
                <DetailRow label="Nombre" value={installer.profile?.full_name} />
                <DetailRow
                  label="Experiencia"
                  value={installer.years_of_experience ? `${installer.years_of_experience} años` : null}
                />
                <DetailRow
                  label="Portfolio"
                  value={
                    installer.portfolio_url ? (
                      <a
                        href={installer.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline flex items-center gap-1"
                      >
                        <Globe size={12} />
                        {installer.portfolio_url}
                      </a>
                    ) : null
                  }
                />
                <DetailRow
                  label="Rating"
                  value={
                    installer.avg_rating > 0 ? (
                      <span className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        {installer.avg_rating.toFixed(1)} ({installer.total_reviews} reseñas)
                      </span>
                    ) : (
                      'Sin reseñas'
                    )
                  }
                />
                <DetailRow
                  label="Verificado"
                  value={installer.is_verified ? 'Sí' : 'No'}
                />
              </div>
            </div>

            {/* Contacto */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Contacto
              </h4>
              <div className="bg-white rounded-lg p-4 border border-gray-100 space-y-2">
                <DetailRow
                  label="Email"
                  value={
                    installer.profile?.email ? (
                      <span className="flex items-center gap-1">
                        <Mail size={12} className="text-gray-400" />
                        {installer.profile.email}
                      </span>
                    ) : null
                  }
                />
                <DetailRow
                  label="Teléfono"
                  value={
                    installer.profile?.phone ? (
                      <span className="flex items-center gap-1">
                        <Phone size={12} className="text-gray-400" />
                        {installer.profile.phone}
                      </span>
                    ) : null
                  }
                />
                <DetailRow
                  label="País"
                  value={installer.country === 'AR' ? 'Argentina' : installer.country === 'BR' ? 'Brasil' : installer.country}
                />
                <DetailRow label="Registrado" value={formatDate(installer.created_at)} />
                {installer.approved_at && (
                  <DetailRow label="Aprobado" value={formatDate(installer.approved_at)} />
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {installer.bio && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Descripción profesional
              </h4>
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{installer.bio}</p>
              </div>
            </div>
          )}

          {/* Habilidades */}
          {installer.skills && installer.skills.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Habilidades ({installer.skills.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {installer.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                  >
                    {skill.skill_name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Motivo de rechazo */}
          {installer.rejected_reason && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Motivo de rechazo/cambios
              </h4>
              <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                <p className="text-sm text-red-700">{installer.rejected_reason}</p>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex gap-2 pt-2 border-t border-gray-200">
            {(installer.status === 'pending_review' || installer.status === 'draft') && (
              <>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() =>
                    onAction(
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
                    onAction(
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
                  Solicitar cambios
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() =>
                    onAction(
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
                  onAction(
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
                  onAction(
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
                  onAction(
                    installer.id,
                    'pending_review',
                    'Reenviar a revisión',
                    `"${installer.profile?.full_name}" volverá a pendiente de revisión.`,
                    'Reenviar'
                  )
                }
              >
                Reenviar a revisión
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="text-gray-500 shrink-0 w-24">{label}:</span>
      <span className="text-gray-900">{value}</span>
    </div>
  )
}
