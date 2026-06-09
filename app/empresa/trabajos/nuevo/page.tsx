'use client'

import { PageHeader } from '@/components/ui/PageHeader'
import { JobForm } from '@/components/empresa/JobForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NuevoTrabajoPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link
        href="/empresa/trabajos"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-primary-500 transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a trabajos
      </Link>

      <PageHeader
        title="Publicar nuevo trabajo"
        description="Completá los datos del trabajo de instalación gráfica que necesitás"
      />

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <JobForm />
      </div>
    </div>
  )
}
