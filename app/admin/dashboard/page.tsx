'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Building2,
  Wrench,
  Briefcase,
  AlertTriangle,
  Shield,
  Users,
  Clock,
  Activity,
  ArrowRight,
  ScrollText,
  Settings,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatsCard } from '@/components/ui/StatsCard'
import { useAuth } from '@/providers/AuthProvider'
import { getAdminStats, getAuditLogs } from '@/lib/actions/admin'
import type { AdminStats } from '@/lib/actions/types'
import { formatRelativeDate } from '@/lib/utils/format'

export default function AdminDashboardPage() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentLogs, setRecentLogs] = useState<Array<{
    id: string
    action_type: string
    affected_entity_type: string
    created_at: string
    admin?: { full_name: string; email: string }
  }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, logsData] = await Promise.all([
          getAdminStats(),
          getAuditLogs(10),
        ])
        setStats(statsData)
        setRecentLogs(logsData)
      } catch (err) {
        console.error('Error cargando datos admin:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const ACTION_LABELS: Record<string, string> = {
    company_verified: 'Empresa verificada',
    company_rejected: 'Empresa rechazada',
    company_suspended: 'Empresa suspendida',
    installer_approved: 'Instalador aprobado',
    installer_rejected: 'Instalador rechazado',
    installer_changes_requested: 'Cambios solicitados a instalador',
    installer_suspended: 'Instalador suspendido',
    approve_job: 'Trabajo aprobado',
    reject_job: 'Trabajo rechazado',
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Panel de Administración"
        description={`Bienvenido, ${profile?.full_name || 'Admin'}`}
      />

      {/* Stats principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Empresas"
          value={stats?.totalCompanies || 0}
          icon={Building2}
          color="primary"
          description="Total registradas"
        />
        <StatsCard
          title="Instaladores"
          value={stats?.totalInstallers || 0}
          icon={Wrench}
          color="accent"
          description="Total registrados"
        />
        <StatsCard
          title="Trabajos activos"
          value={stats?.activeJobs || 0}
          icon={Briefcase}
          color="green"
          description="Publicados y en curso"
        />
        <StatsCard
          title="Disputas abiertas"
          value={stats?.openDisputes || 0}
          icon={AlertTriangle}
          color="red"
          description="Requieren atención"
        />
      </div>

      {/* Stats de moderación (clickeables) */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Pendientes de moderación
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Link href="/admin/empresas" className="block hover:opacity-90 transition-opacity">
          <StatsCard
            title="Empresas por verificar"
            value={stats?.pendingCompanies || 0}
            icon={Shield}
            color="purple"
            description="Click para gestionar"
          />
        </Link>
        <Link href="/admin/instaladores" className="block hover:opacity-90 transition-opacity">
          <StatsCard
            title="Instaladores por aprobar"
            value={stats?.pendingInstallers || 0}
            icon={Users}
            color="accent"
            description="Click para gestionar"
          />
        </Link>
        <Link href="/admin/trabajos" className="block hover:opacity-90 transition-opacity">
          <StatsCard
            title="Trabajos por moderar"
            value={stats?.pendingJobs || 0}
            icon={Clock}
            color="primary"
            description="Click para gestionar"
          />
        </Link>
      </div>

      {/* Accesos rápidos */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Administración
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {[
          { href: '/admin/empresas', label: 'Empresas', icon: Building2 },
          { href: '/admin/instaladores', label: 'Instaladores', icon: Wrench },
          { href: '/admin/trabajos', label: 'Trabajos', icon: Briefcase },
          { href: '/admin/disputas', label: 'Disputas', icon: AlertTriangle },
          { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
          { href: '/admin/auditoria', label: 'Auditoría', icon: ScrollText },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-2 bg-white rounded-xl border border-gray-200 p-4 hover:border-primary-300 hover:shadow-sm transition-all group"
          >
            <item.icon size={20} className="text-gray-400 group-hover:text-primary-600 transition-colors" />
            <span className="text-xs font-medium text-gray-700">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Actividad reciente */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={20} className="text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Actividad reciente
          </h3>
        </div>

        {recentLogs.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No hay actividad reciente para mostrar.
          </p>
        ) : (
          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {ACTION_LABELS[log.action_type] || log.action_type}
                  </p>
                  <p className="text-xs text-gray-500">
                    por {log.admin?.full_name || 'Admin'} &middot;{' '}
                    {log.affected_entity_type}
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  {formatRelativeDate(log.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
