'use client'

import { useEffect, useState } from 'react'
import { Building2, Search, ExternalLink } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
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

      {/* Tabla */}
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
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Empresa</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Contacto</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">País</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {company.company_name || 'Sin nombre'}
                        </p>
                        {company.tax_id && (
                          <p className="text-xs text-gray-500">CUIT: {company.tax_id}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-900">{company.profile?.full_name}</p>
                      <p className="text-xs text-gray-500">{company.profile?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {company.country === 'AR' ? 'Argentina' : company.country === 'BR' ? 'Brasil' : company.country}
                    </td>
                    <td className="px-4 py-3">
                      <CompanyStatusBadge status={company.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {formatDate(company.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-1 justify-end">
                        {company.status === 'pending_review' && (
                          <>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() =>
                                openModal(
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
                                openModal(
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
                              openModal(
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
                              openModal(
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
                              openModal(
                                company.id,
                                'pending_review',
                                'Reenviar a revisión',
                                `La empresa "${company.company_name}" volverá a pendiente de revisión.`,
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
