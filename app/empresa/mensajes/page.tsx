'use client'

import { MessageSquare } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'

export default function EmpresaMensajesPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Mensajes"
        description="Comunicación con instaladores"
      />

      <div className="bg-white rounded-xl border border-gray-200">
        <EmptyState
          icon={MessageSquare}
          title="No tenés mensajes"
          description="Cuando coordines una instalación con un instalador, podrás comunicarte desde acá."
        />
      </div>
    </div>
  )
}
