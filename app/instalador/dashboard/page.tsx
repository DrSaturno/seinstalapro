'use client'

import { Search, ClipboardList, FileCheck2, Star } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatsCard } from '@/components/ui/StatsCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/providers/AuthProvider'
import Link from 'next/link'

export default function InstaladorDashboardPage() {
  const { profile } = useAuth()

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title={`Hola, ${profile?.full_name || 'Instalador'}`}
        description="Encontrá trabajos de instalación gráfica y hacé crecer tu negocio"
        actions={
          <Link href="/instalador/trabajos">
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Buscar trabajos
            </Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Trabajos disponibles"
          value={0}
          icon={Search}
          color="primary"
          description="En tu zona"
        />
        <StatsCard
          title="Mis ofertas"
          value={0}
          icon={ClipboardList}
          color="accent"
          description="Enviadas"
        />
        <StatsCard
          title="En progreso"
          value={0}
          icon={FileCheck2}
          color="green"
          description="Acuerdos activos"
        />
        <StatsCard
          title="Calificación"
          value="-"
          icon={Star}
          color="purple"
          description="Sin reseñas aún"
        />
      </div>

      {/* Empty state */}
      <div className="bg-white rounded-xl border border-gray-200">
        <EmptyState
          icon={Search}
          title="Empezá a buscar trabajos"
          description="Explorá los trabajos de instalación gráfica disponibles y enviá tus ofertas para empezar a trabajar."
          actionLabel="Ver trabajos disponibles"
          actionHref="/instalador/trabajos"
        />
      </div>
    </div>
  )
}
