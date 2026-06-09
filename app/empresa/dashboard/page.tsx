'use client'

import { Briefcase, ClipboardList, FileCheck2, Plus } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatsCard } from '@/components/ui/StatsCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/providers/AuthProvider'
import Link from 'next/link'

export default function EmpresaDashboardPage() {
  const { profile } = useAuth()

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title={`Hola, ${profile?.full_name || 'Empresa'}`}
        description="Gestioná tus trabajos de instalación gráfica"
        actions={
          <Link href="/empresa/trabajos/nuevo">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Publicar trabajo
            </Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatsCard
          title="Trabajos publicados"
          value={0}
          icon={Briefcase}
          color="primary"
          description="Total activos"
        />
        <StatsCard
          title="Ofertas recibidas"
          value={0}
          icon={ClipboardList}
          color="accent"
          description="Pendientes de revisión"
        />
        <StatsCard
          title="En progreso"
          value={0}
          icon={FileCheck2}
          color="green"
          description="Acuerdos activos"
        />
      </div>

      {/* Empty state */}
      <div className="bg-white rounded-xl border border-gray-200">
        <EmptyState
          icon={Briefcase}
          title="No tenés trabajos publicados"
          description="Publicá tu primer trabajo de instalación gráfica y empezá a recibir ofertas de instaladores profesionales."
          actionLabel="Publicar mi primer trabajo"
          actionHref="/empresa/trabajos/nuevo"
        />
      </div>
    </div>
  )
}
