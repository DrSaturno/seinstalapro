'use client'

import { useEffect, useState } from 'react'
import { ScrollText, Building2, Wrench, Briefcase } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { getAuditLogs } from '@/lib/actions/admin'
import { formatRelativeDate } from '@/lib/utils/format'

type AuditLog = {
  id: string
  action_type: string
  affected_entity_type: string
  affected_entity_id: string
  details: Record<string, unknown> | null
  created_at: string
  admin?: { full_name: string; email: string }
}

const ACTION_LABELS: Record<string, string> = {
  company_verified: 'Empresa verificada',
  company_rejected: 'Empresa rechazada',
  company_suspended: 'Empresa suspendida',
  company_pending_review: 'Empresa reenviada a revisión',
  installer_approved: 'Instalador aprobado',
  installer_rejected: 'Instalador rechazado',
  installer_changes_requested: 'Cambios solicitados a instalador',
  installer_suspended: 'Instalador suspendido',
  installer_pending_review: 'Instalador reenviado a revisión',
  approve_job: 'Trabajo aprobado',
  reject_job: 'Trabajo rechazado',
}

const ENTITY_ICONS: Record<string, typeof Building2> = {
  company: Building2,
  installer: Wrench,
  job: Briefcase,
}

const ENTITY_LABELS: Record<string, string> = {
  company: 'Empresa',
  installer: 'Instalador',
  job: 'Trabajo',
}

export default function AdminAuditoriaPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadLogs() {
      try {
        const data = await getAuditLogs(100)
        setLogs(data)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    loadLogs()
  }, [])

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Registro de Auditoría"
        description="Historial de todas las acciones administrativas"
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <ScrollText size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No hay registros de auditoría todavía.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Acción</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Entidad</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Admin</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Detalle</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => {
                  const EntityIcon = ENTITY_ICONS[log.affected_entity_type] || ScrollText
                  const details = log.details as Record<string, unknown> | null
                  return (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">
                          {ACTION_LABELS[log.action_type] || log.action_type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <EntityIcon size={14} className="text-gray-400" />
                          <span className="text-gray-600">
                            {ENTITY_LABELS[log.affected_entity_type] || log.affected_entity_type}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 font-mono truncate max-w-[120px]">
                          {log.affected_entity_id.slice(0, 8)}...
                        </p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {log.admin?.full_name || 'Sistema'}
                      </td>
                      <td className="px-4 py-3">
                        {details?.reason ? (
                          <p className="text-xs text-gray-500 max-w-[200px] truncate">
                            {String(details.reason)}
                          </p>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                        {details?.previous_status && details?.new_status ? (
                          <p className="text-xs text-gray-400">
                            {String(details.previous_status)} → {String(details.new_status)}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {formatRelativeDate(log.created_at)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
