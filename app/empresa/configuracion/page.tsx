'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { createClient } from '@/lib/supabase/client'
import { changePassword } from '@/lib/auth/actions'

export default function EmpresaConfiguracionPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChanging, setIsChanging] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut({ scope: 'global' })
    } catch (err) {
      console.error('Error en signOut:', err)
    }
    window.location.replace('/login')
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 8 caracteres' })
      return
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' })
      return
    }

    setIsChanging(true)
    const result = await changePassword(currentPassword, newPassword)
    if (result.success) {
      setMessage({ type: 'success', text: result.message || 'Contraseña actualizada' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      setMessage({ type: 'error', text: result.error || 'Error al cambiar la contraseña' })
    }
    setIsChanging(false)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <PageHeader
        title="Configuración"
        description="Ajustes de tu cuenta"
      />

      <div className="space-y-6">
        {/* Cambiar contraseña */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Cambiar contraseña
          </h3>

          {message && (
            <Alert
              variant={message.type}
              onClose={() => setMessage(null)}
              className="mb-4"
            >
              {message.text}
            </Alert>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <Input
              label="Contraseña actual"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Input
              label="Nueva contraseña"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              label="Confirmar nueva contraseña"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button type="submit" isLoading={isChanging} size="sm">
              Cambiar contraseña
            </Button>
          </form>
        </div>

        {/* Cerrar sesión */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Sesión
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Cerrá tu sesión en este dispositivo.
          </p>
          <Button variant="danger" size="sm" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </div>
      </div>
    </div>
  )
}
