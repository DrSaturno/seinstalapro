'use client'

import { Settings } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { logout } from '@/lib/auth/actions'

export default function EmpresaConfiguracionPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <PageHeader
        title="Configuración"
        description="Ajustes de tu cuenta"
      />

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {/* Notificaciones */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Notificaciones
          </h3>
          <p className="text-sm text-gray-500">
            Las preferencias de notificaciones estarán disponibles próximamente.
          </p>
        </div>

        <div className="border-t border-gray-200" />

        {/* Cerrar sesión */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Sesión
          </h3>
          <form action={logout}>
            <Button type="submit" variant="danger" size="sm">
              Cerrar sesión
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
