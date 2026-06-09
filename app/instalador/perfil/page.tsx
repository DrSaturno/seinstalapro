'use client'

import { PageHeader } from '@/components/ui/PageHeader'
import { InstallerProfileForm } from '@/components/instalador/InstallerProfileForm'

export default function InstaladorPerfilPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <PageHeader
        title="Mi Perfil"
        description="Completá tu perfil para recibir y ofertar en trabajos"
      />

      <InstallerProfileForm />
    </div>
  )
}
