'use client'

import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

export default function AdminConfiguracionPage() {
  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <PageHeader
        title="Configuración"
        description="Ajustes del panel de administración"
      />

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {/* Plataforma */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Plataforma
          </h3>
          <p className="text-sm text-gray-500">
            Las configuraciones de la plataforma (comisiones, países habilitados, categorías) estarán disponibles próximamente.
          </p>
        </div>

        <div className="border-t border-gray-200" />

        {/* Notificaciones */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Notificaciones admin
          </h3>
          <p className="text-sm text-gray-500">
            Las preferencias de notificaciones administrativas estarán disponibles próximamente.
          </p>
        </div>

        <div className="border-t border-gray-200" />

        {/* Sesión */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Sesión
          </h3>
          <Button variant="danger" size="sm" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </div>
      </div>
    </div>
  )
}
