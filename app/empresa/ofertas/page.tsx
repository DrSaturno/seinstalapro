'use client'

import { ClipboardList } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'

export default function EmpresaOfertasPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Ofertas Recibidas"
        description="Revisá y gestioná las ofertas de los instaladores"
      />

      <div className="bg-white rounded-xl border border-gray-200">
        <EmptyState
          icon={ClipboardList}
          title="No tenés ofertas pendientes"
          description="Cuando los instaladores envíen ofertas a tus trabajos publicados, aparecerán acá."
          actionLabel="Ver mis trabajos"
          actionHref="/empresa/trabajos"
        />
      </div>
    </div>
  )
}
