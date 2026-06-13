'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { MessagesPanel } from '@/components/shared/MessagesPanel'

function MensajesContent() {
  const searchParams = useSearchParams()
  const agreementId = searchParams.get('acuerdo') || undefined

  return <MessagesPanel initialAgreementId={agreementId} />
}

export default function InstaladorMensajesPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Mensajes"
        description="Coordiná las instalaciones con las empresas"
      />

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        }
      >
        <MensajesContent />
      </Suspense>
    </div>
  )
}
