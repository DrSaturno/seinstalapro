'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Check, X, Tag } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { createClient } from '@/lib/supabase/client'
import {
  getAdminCategories,
  createCategory,
  updateCategory,
} from '@/lib/actions/admin'
import { clsx } from 'clsx'

type Category = {
  id: string
  name: string
  description?: string
  is_active: boolean
  order_index: number
}

export default function AdminConfiguracionPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Crear
  const [showNewForm, setShowNewForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // Editar
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const loadCategories = useCallback(async () => {
    try {
      const data = await getAdminCategories()
      setCategories(data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  const handleCreate = async () => {
    if (!newName.trim()) return
    setIsCreating(true)
    setError(null)
    try {
      const result = await createCategory(newName, newDescription)
      if (result.success) {
        setSuccess(result.message || 'Categoría creada')
        setNewName('')
        setNewDescription('')
        setShowNewForm(false)
        await loadCategories()
      } else {
        setError(result.error || 'Error')
      }
    } catch (err) {
      setError('Error inesperado')
    } finally {
      setIsCreating(false)
    }
  }

  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditDescription(cat.description || '')
  }

  const handleSaveEdit = async () => {
    if (!editingId) return
    setIsSaving(true)
    setError(null)
    try {
      const result = await updateCategory(editingId, {
        name: editName,
        description: editDescription,
      })
      if (result.success) {
        setSuccess('Categoría actualizada')
        setEditingId(null)
        await loadCategories()
      } else {
        setError(result.error || 'Error')
      }
    } catch (err) {
      setError('Error inesperado')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleActive = async (cat: Category) => {
    setError(null)
    try {
      const result = await updateCategory(cat.id, { is_active: !cat.is_active })
      if (result.success) {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === cat.id ? { ...c, is_active: !c.is_active } : c
          )
        )
      } else {
        setError(result.error || 'Error')
      }
    } catch (err) {
      setError('Error inesperado')
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader
        title="Configuración"
        description="Administración de la plataforma"
      />

      {error && (
        <Alert variant="error" onClose={() => setError(null)} className="mb-4">
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)} className="mb-4">
          {success}
        </Alert>
      )}

      {/* Categorías de trabajos */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Categorías de trabajos
            </h3>
            <p className="text-sm text-gray-500">
              Las categorías activas aparecen al publicar un trabajo
            </p>
          </div>
          <Button size="sm" onClick={() => setShowNewForm(!showNewForm)}>
            <Plus className="h-4 w-4 mr-1" />
            Nueva
          </Button>
        </div>

        {/* Formulario nueva categoría */}
        {showNewForm && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
            <Input
              label="Nombre *"
              placeholder="Ej: Ploteo vehicular"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Input
              label="Descripción"
              placeholder="Descripción breve de la categoría"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreate} isLoading={isCreating}>
                Crear categoría
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowNewForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Lista */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={clsx(
                  'flex items-center gap-3 p-3 rounded-lg border',
                  cat.is_active
                    ? 'border-gray-200 bg-white'
                    : 'border-gray-100 bg-gray-50 opacity-60'
                )}
              >
                <Tag size={16} className="text-gray-400 shrink-0" />

                {editingId === cat.id ? (
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Nombre"
                    />
                    <input
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Descripción"
                    />
                  </div>
                ) : (
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{cat.name}</p>
                    {cat.description && (
                      <p className="text-xs text-gray-500 truncate">{cat.description}</p>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-1 shrink-0">
                  {editingId === cat.id ? (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        disabled={isSaving}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                        aria-label="Guardar"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 text-gray-400 hover:bg-gray-100 rounded"
                        aria-label="Cancelar"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(cat)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                        aria-label="Editar"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleToggleActive(cat)}
                        className={clsx(
                          'px-2 py-1 rounded text-xs font-medium transition-colors',
                          cat.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        )}
                      >
                        {cat.is_active ? 'Activa' : 'Inactiva'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sesión */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sesión</h3>
        <Button variant="danger" size="sm" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </div>
    </div>
  )
}
