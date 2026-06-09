'use client'

import { Users } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'

export default function AdminUsuariosPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Usuarios"
        description="Gestión de todos los usuarios de la plataforma"
      />

      <div className="bg-white rounded-xl border border-gray-200">
        <EmptyState
          icon={Users}
          title="Gestión de usuarios"
          description="La gestión avanzada de usuarios estará disponible próximamente. Mientras tanto, usá las secciones de Empresas e Instaladores."
        />
      </div>
    </div>
  )
}
