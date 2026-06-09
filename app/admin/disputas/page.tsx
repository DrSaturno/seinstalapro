'use client'

import { AlertTriangle } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'

export default function AdminDisputasPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Disputas"
        description="Gestioná las disputas entre empresas e instaladores"
      />

      <div className="bg-white rounded-xl border border-gray-200">
        <EmptyState
          icon={AlertTriangle}
          title="No hay disputas abiertas"
          description="Cuando una empresa o instalador abra una disputa, aparecerá acá para que la medies."
        />
      </div>
    </div>
  )
}
