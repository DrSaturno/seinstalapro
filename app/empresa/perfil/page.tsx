'use client'

import { PageHeader } from '@/components/ui/PageHeader'
import { CompanyProfileForm } from '@/components/empresa/CompanyProfileForm'

export default function EmpresaPerfilPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <PageHeader
        title="Mi Empresa"
        description="Editá la información de tu empresa"
      />

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <CompanyProfileForm />
      </div>
    </div>
  )
}
