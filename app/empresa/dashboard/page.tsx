'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Briefcase,
  ClipboardList,
  FileCheck2,
  Plus,
  Search,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatsCard } from '@/components/ui/StatsCard'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/providers/AuthProvider'
import { getCompanyStats } from '@/lib/actions/company'
import Link from 'next/link'

export default function EmpresaDashboardPage() {
  const { profile } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<{
    totalJobs: number
    publishedJobs: number
    pendingOffers: number
    activeAgreements: number
    completedJobs: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getCompanyStats()
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
        title={`Hola, ${profile?.full_name?.split(' ')[0] || 'Empresa'}`}
        description="Gestiona tus trabajos de instalacion grafica"
        actions={
          <Button onClick={() => router.push('/empresa/trabajos/nuevo')}>
            <Plus className="h-4 w-4 mr-2" />
            Publicar trabajo
          </Button>
        }
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
            title="Trabajos publicados"
            value={stats?.publishedJobs || 0}
            icon={Briefcase}
            color="primary"
            description={`${stats?.totalJobs || 0} total`}
          />
          <StatsCard
            title="Ofertas pendientes"
            value={stats?.pendingOffers || 0}
            icon={ClipboardList}
            color="accent"
            description="Esperando tu revision"
          />
          <StatsCard
            title="Acuerdos activos"
            value={stats?.activeAgreements || 0}
            icon={FileCheck2}
            color="green"
            description="En coordinacion o progreso"
          />
          <StatsCard
            title="Completados"
            value={stats?.completedJobs || 0}
            icon={CheckCircle2}
            color="purple"
            description="Trabajos finalizados"
          />
        </div>
      )}

      {/* Acciones rapidas */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Acciones rapidas
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link href="/empresa/trabajos/nuevo">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm shadow-slate-100/30 hover:border-primary-200 hover:shadow-md hover:shadow-primary-500/5 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100/50 group-hover:bg-primary-50 group-hover:border-primary-100/50 text-slate-400 group-hover:text-primary-600 transition-all duration-200 shrink-0">
                <Plus size={20} className="transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 group-hover:text-primary-600 transition-colors truncate">
                  Publicar trabajo
                </h3>
                <p className="text-xs text-slate-400 mt-1 truncate">
                  Crea un nuevo trabajo de instalación
                </p>
              </div>
              <ArrowRight
                size={18}
                className="text-slate-300 group-hover:text-primary-600 transition-all group-hover:translate-x-0.5 duration-200"
              />
            </div>
          </div>
        </Link>
 
        <Link href="/empresa/trabajos">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm shadow-slate-100/30 hover:border-primary-200 hover:shadow-md hover:shadow-primary-500/5 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100/50 group-hover:bg-primary-50 group-hover:border-primary-100/50 text-slate-400 group-hover:text-primary-600 transition-all duration-200 shrink-0">
                <Search size={20} className="transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 group-hover:text-primary-600 transition-colors truncate">
                  Mis trabajos
                </h3>
                <p className="text-xs text-slate-400 mt-1 truncate">
                  Gestiona tus publicaciones
                </p>
              </div>
              <ArrowRight
                size={18}
                className="text-slate-300 group-hover:text-primary-600 transition-all group-hover:translate-x-0.5 duration-200"
              />
            </div>
          </div>
        </Link>
 
        <Link href="/empresa/ofertas">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm shadow-slate-100/30 hover:border-primary-200 hover:shadow-md hover:shadow-primary-500/5 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100/50 group-hover:bg-primary-50 group-hover:border-primary-100/50 text-slate-400 group-hover:text-primary-600 transition-all duration-200 shrink-0">
                <ClipboardList size={20} className="transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 group-hover:text-primary-600 transition-colors truncate">
                  Ofertas recibidas
                </h3>
                <p className="text-xs text-slate-400 mt-1 truncate">
                  Revisa propuestas de instaladores
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

      {/* Tip */}
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-5">
        <h3 className="font-semibold text-primary-900 mb-1">
          Mejora tus publicaciones
        </h3>
        <p className="text-sm text-primary-700 mb-3">
          Cuantos mas detalles incluyas en tus trabajos (fotos, medidas, tipo de superficie, restricciones de horario), mejores ofertas vas a recibir de los instaladores.
        </p>
        <Button
          size="sm"
          variant="primary"
          onClick={() => router.push('/empresa/perfil')}
        >
          Completar perfil de empresa
        </Button>
      </div>
    </div>
  )
}
