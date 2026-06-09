'use client'

import { useEffect, useState } from 'react'
import {
  ClipboardList,
  FileCheck2,
  Star,
  Briefcase,
  Search,
  ArrowRight,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatsCard } from '@/components/ui/StatsCard'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/providers/AuthProvider'
import { getInstallerStats } from '@/lib/actions/installer'
import Link from 'next/link'

export default function InstaladorDashboardPage() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<{
    activeOffers: number
    acceptedOffers: number
    activeAgreements: number
    completedJobs: number
    avgRating: number
    totalReviews: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getInstallerStats()
        setStats(data)
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
            title="Ofertas activas"
            value={stats?.activeOffers || 0}
            icon={ClipboardList}
            color="primary"
            description="Enviadas y pendientes"
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

      {/* Acciones rápidas */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Acciones rápidas
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link href="/instalador/trabajos">
          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary-50">
                <Search size={20} className="text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-700">
                  Buscar trabajos
                </h3>
                <p className="text-sm text-gray-500">
                  Explorá trabajos disponibles y enviá ofertas
                </p>
              </div>
              <ArrowRight
                size={18}
                className="text-gray-400 group-hover:text-primary-600 transition-colors"
              />
            </div>
          </div>
        </Link>

        <Link href="/instalador/ofertas">
          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-accent-50">
                <ClipboardList size={20} className="text-accent-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-700">
                  Mis ofertas
                </h3>
                <p className="text-sm text-gray-500">
                  Seguí el estado de tus ofertas enviadas
                </p>
              </div>
              <ArrowRight
                size={18}
                className="text-gray-400 group-hover:text-primary-600 transition-colors"
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
          Un perfil completo con habilidades y portfolio te da más chances de que
          las empresas acepten tus ofertas.
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
