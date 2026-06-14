'use client'

import { useEffect, useState } from 'react'
import { Building2, Search, Globe, MapPin, FileText, Mail, Phone, Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { CompanyStatusBadge } from '@/components/admin/CompanyStatusBadge'
import { StatusActionModal } from '@/components/admin/StatusActionModal'
import { getAdminCompanies, updateCompanyStatus } from '@/lib/actions/admin'
import { formatDate } from '@/lib/utils/format'
import { toast } from 'sonner'
import type { Company, Profile, CompanyStatus } from '@/types/database'

type CompanyWithProfile = Company & { profile?: Profile }

const STATUS_FILTERS = [
  { value: 'all', label: 'Todas' },
  { value: 'pending_review', label: 'Pendientes' },
  { value: 'verified', label: 'Verificadas' },
  { value: 'rejected', label: 'Rechazadas' },
  { value: 'suspended', label: 'Suspendidas' },
]

export default function AdminEmpresasPage() {
  const [companies, setCompanies] = useState<CompanyWithProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [modal, setModal] = useState<{
    isOpen: boolean
    companyId: string
    action: CompanyStatus
    title: string
    description: string
    confirmLabel: string
    confirmVariant: 'primary' | 'danger'
    requireReason: boolean
  } | null>(null)

  const loadCompanies = async () => {
    setIsLoading(true)
    try {
      const data = await getAdminCompanies(filter)
      setCompanies(data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCompanies()
  }, [filter])

  const filteredCompanies = companies.filter((c) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      c.company_name?.toLowerCase().includes(term) ||
      c.profile?.full_name?.toLowerCase().includes(term) ||
      c.profile?.email?.toLowerCase().includes(term)
    )
  })

  const openModal = (
    companyId: string,
    action: CompanyStatus,
    title: string,
    description: string,
    confirmLabel: string,
    confirmVariant: 'primary' | 'danger' = 'primary',
    requireReason = false
  ) => {
    setModal({
      isOpen: true,
      companyId,
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
    const result = await updateCompanyStatus(modal.companyId, modal.action, reason)
    if (result.success) {
      toast.success(result.message)
      loadCompanies()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Gestión de Empresas"
        description="Revisá y moderá las empresas registradas"
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
            placeholder="Buscar empresa..."
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
      ) : filteredCompanies.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No se encontraron empresas.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCompanies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              isExpanded={expandedId === company.id}
              onToggleExpand={() =>
                setExpandedId(expandedId === company.id ? null : company.id)
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

function CompanyCard({
  company,
  isExpanded,
  onToggleExpand,
  onAction,
}: {
  company: CompanyWithProfile
  isExpanded: boolean
  onToggleExpand: () => void
  onAction: (
    companyId: string,
    action: CompanyStatus,
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
              src={company.logo_url}
              fallback={company.company_name || 'E'}
              size="lg"
            />
            <div className="min-w-0">
              <p className="font-semibold text-gray-900">
                {company.company_name || 'Sin nombre'}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                <span>{company.profile?.full_name}</span>
                <span className="text-gray-300">|</span>
                <span>{company.profile?.email}</span>
              </div>
              {company.tax_id && (
                <p className="text-xs text-gray-400 mt-0.5">CUIT: {company.tax_id}</p>
              )}
            </div>
          </div>
          <CompanyStatusBadge status={company.status} />
        </div>

        {/* Info compacta + acciones */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {company.country === 'AR' ? 'Argentina' : company.country === 'BR' ? 'Brasil' : company.country}
              {company.city && `, ${company.city}`}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatDate(company.created_at)}
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
          {/* Datos de la empresa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Datos de la empresa
              </h4>
              <div className="bg-white rounded-lg p-4 border border-gray-100 space-y-2">
                <DetailRow label="Razón social" value={company.company_name} />
                <DetailRow label="CUIT / CNPJ" value={company.tax_id} />
                <DetailRow
                  label="Sitio web"
                  value={
                    company.website ? (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline flex items-center gap-1"
                      >
                        <Globe size={12} />
                        {company.website}
                      </a>
                    ) : null
                  }
                />
                <DetailRow
                  label="Dirección"
                  value={[company.address, company.city, company.country === 'AR' ? 'Argentina' : company.country]
                    .filter(Boolean)
                    .join(', ')}
                />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Contacto
              </h4>
              <div className="bg-white rounded-lg p-4 border border-gray-100 space-y-2">
                <DetailRow label="Nombre" value={company.profile?.full_name} />
                <DetailRow
                  label="Email"
                  value={
                    company.profile?.email ? (
                      <span className="flex items-center gap-1">
                        <Mail size={12} className="text-gray-400" />
                        {company.profile.email}
                      </span>
                    ) : null
                  }
                />
                <DetailRow
                  label="Teléfono"
                  value={
                    company.profile?.phone ? (
                      <span className="flex items-center gap-1">
                        <Phone size={12} className="text-gray-400" />
                        {company.profile.phone}
                      </span>
                    ) : null
                  }
                />
                <DetailRow label="Registrado" value={formatDate(company.created_at)} />
                {company.verified_at && (
                  <DetailRow label="Verificado" value={formatDate(company.verified_at)} />
                )}
              </div>
            </div>
          </div>

          {/* Descripción */}
          {company.description && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Descripción
              </h4>
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{company.description}</p>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex gap-2 pt-2 border-t border-gray-200">
            {company.status === 'pending_review' && (
              <>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() =>
                    onAction(
                      company.id,
                      'verified',
                      'Verificar empresa',
                      `Vas a verificar a "${company.company_name}". La empresa podrá publicar trabajos.`,
                      'Verificar'
                    )
                  }
                >
                  Verificar
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() =>
                    onAction(
                      company.id,
                      'rejected',
                      'Rechazar empresa',
                      `Vas a rechazar a "${company.company_name}".`,
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
            {company.status === 'verified' && (
              <Button
                size="sm"
                variant="danger"
                onClick={() =>
                  onAction(
                    company.id,
                    'suspended',
                    'Suspender empresa',
                    `Vas a suspender a "${company.company_name}". No podrá operar.`,
                    'Suspender',
                    'danger',
                    true
                  )
                }
              >
                Suspender
              </Button>
            )}
            {company.status === 'suspended' && (
              <Button
                size="sm"
                variant="primary"
                onClick={() =>
                  onAction(
                    company.id,
                    'verified',
                    'Reactivar empresa',
                    `Vas a reactivar a "${company.company_name}".`,
                    'Reactivar'
                  )
                }
              >
                Reactivar
              </Button>
            )}
            {company.status === 'rejected' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  onAction(
                    company.id,
                    'pending_review',
                    'Reenviar a revisión',
                    `La empresa "${company.company_name}" volverá a pendiente de revisión.`,
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
