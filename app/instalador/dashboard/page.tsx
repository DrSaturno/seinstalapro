'use client'

import { useEffect, useState } from 'react'
import {
  ClipboardList,
  FileCheck2,
  Star,
  Briefcase,
  Users,
  ArrowRight,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatsCard } from '@/components/ui/StatsCard'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/providers/AuthProvider'
import { getInstallerStats } from '@/lib/actions/installer'
import { getMyTeams } from '@/lib/actions/team'
import { getUpcomingInstallations, type UpcomingInstallation } from '@/lib/actions/weather'
import { MyTeamsList } from '@/components/instalador/MyTeamsList'
import { UpcomingInstalls } from '@/components/instalador/UpcomingInstalls'
import type { MyTeam } from '@/lib/actions/types'
import Link from 'next/link'

export default function InstaladorDashboardPage() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<{
    teamsCount: number
    activeAgreements: number
    completedJobs: number
    avgRating: number
    totalReviews: number
  } | null>(null)
  const [teams, setTeams] = useState<MyTeam[]>([])
  const [upcoming, setUpcoming] = useState<UpcomingInstallation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [statsData, teamsData, upcomingData] = await Promise.all([
          getInstallerStats(),
          getMyTeams(),
          getUpcomingInstallations(),
        ])
        setStats(statsData)
        setTeams(teamsData)
        setUpcoming(upcomingData)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title={`Hola, ${profile?.full_name?.split(' ')[0] || 'Instalador'}`}
        description="Resumen de tu actividad en Se Instala Pro"
      />

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
              <div className="h-8 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Equipos"
            value={stats?.teamsCount || 0}
            icon={Users}
            color="primary"
            description="Empresas donde trabajás"
          />
          <StatsCard
            title="Acuerdos en curso"
            value={stats?.activeAgreements || 0}
            icon={FileCheck2}
            color="accent"
            description="Trabajos coordinando o en progreso"
          />
          <StatsCard
            title="Trabajos completados"
            value={stats?.completedJobs || 0}
            icon={Briefcase}
            color="green"
            description="Finalizados exitosamente"
          />
          <StatsCard
            title="Rating"
            value={stats?.avgRating ? stats.avgRating.toFixed(1) : '-'}
            icon={Star}
            color="purple"
            description={`${stats?.totalReviews || 0} reseñas`}
          />
        </div>
      )}

      {/* Próximas instalaciones con clima */}
      {!isLoading && <UpcomingInstalls installations={upcoming} />}

      {/* Mis equipos */}
      {!isLoading && <MyTeamsList teams={teams} />}

      {/* Acciones rápidas */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Acciones rápidas
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <Link href="/instalador/mis-trabajos">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm shadow-slate-100/30 hover:border-primary-200 hover:shadow-md hover:shadow-primary-500/5 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100/50 group-hover:bg-primary-50 group-hover:border-primary-100/50 text-slate-400 group-hover:text-primary-600 transition-all duration-200 shrink-0">
                <ClipboardList size={20} className="transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 group-hover:text-primary-600 transition-colors truncate">
                  Mis trabajos
                </h3>
                <p className="text-xs text-slate-400 mt-1 truncate">
                  Trabajos asignados y disponibles de tus equipos
                </p>
              </div>
              <ArrowRight
                size={18}
                className="text-slate-300 group-hover:text-primary-600 transition-all group-hover:translate-x-0.5 duration-200"
              />
            </div>
          </div>
        </Link>

        <Link href="/instalador/acuerdos">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm shadow-slate-100/30 hover:border-primary-200 hover:shadow-md hover:shadow-primary-500/5 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100/50 group-hover:bg-primary-50 group-hover:border-primary-100/50 text-slate-400 group-hover:text-primary-600 transition-all duration-200 shrink-0">
                <FileCheck2 size={20} className="transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 group-hover:text-primary-600 transition-colors truncate">
                  Mis acuerdos
                </h3>
                <p className="text-xs text-slate-400 mt-1 truncate">
                  Seguí el estado de tus trabajos en curso
                </p>
              </div>
              <ArrowRight
                size={18}
                className="text-slate-300 group-hover:text-primary-600 transition-all group-hover:translate-x-0.5 duration-200"
              />
            </div>
          </div>
        </Link>
      </div>

      {/* Consejo */}
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-5">
        <h3 className="font-semibold text-primary-900 mb-1">
          Completá tu perfil
        </h3>
        <p className="text-sm text-primary-700 mb-3">
          Un perfil completo con habilidades y portfolio ayuda a que las empresas
          de tus equipos te asignen los trabajos indicados.
        </p>
        <Link href="/instalador/perfil">
          <Button size="sm" variant="primary">
            Ir a mi perfil
          </Button>
        </Link>
      </div>
    </div>
  )
}
