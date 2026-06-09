'use client'

import { FileCheck2 } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'

export default function InstaladorAcuerdosPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Acuerdos"
        description="Seguí el progreso de tus instalaciones en curso"
      />

      <div className="bg-white rounded-xl border border-gray-200">
        <EmptyState
          icon={FileCheck2}
          title="No tenés acuerdos activos"
          description="Cuando una empresa acepte tu oferta, el acuerdo aparecerá acá para coordinar la instalación."
        />
      </div>
    </div>
  )
}
