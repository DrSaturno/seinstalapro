'use client'

import { Star } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'

export default function InstaladorResenasPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Reseñas"
        description="Calificaciones que recibiste de las empresas"
      />

      <div className="bg-white rounded-xl border border-gray-200">
        <EmptyState
          icon={Star}
          title="No tenés reseñas"
          description="Cuando completes tu primer trabajo, la empresa podrá dejarte una reseña que aparecerá acá."
        />
      </div>
    </div>
  )
}
