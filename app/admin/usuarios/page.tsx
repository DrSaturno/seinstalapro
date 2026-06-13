'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Users, Search, Building2, Wrench, Shield, ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { Avatar } from '@/components/ui/Avatar'
import { SkeletonTable } from '@/components/ui/Skeleton'
import { getAdminUsers } from '@/lib/actions/admin'
import { formatDate } from '@/lib/utils/format'
import { clsx } from 'clsx'
import type { Profile } from '@/types/database'

const ROLE_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'company', label: 'Empresas' },
  { value: 'installer', label: 'Instaladores' },
  { value: 'admin', label: 'Admins' },
]

const ROLE_CONFIG: Record<string, { label: string; icon: typeof Users; color: string }> = {
  company: { label: 'Empresa', icon: Building2, color: 'text-blue-600 bg-blue-50' },
  installer: { label: 'Instalador', icon: Wrench, color: 'text-orange-600 bg-orange-50' },
  admin: { label: 'Admin', icon: Shield, color: 'text-purple-600 bg-purple-50' },
}

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [roleFilter, setRoleFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const loadUsers = useCallback(async (role: string) => {
    setIsLoading(true)
    try {
      const data = await getAdminUsers(role)
      setUsers(data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers(roleFilter)
  }, [roleFilter, loadUsers])

  const filtered = users.filter((u) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Usuarios"
        description="Todos los usuarios registrados en la plataforma"
      />

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          {ROLE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setRoleFilter(f.value)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                roleFilter === f.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 sm:max-w-xs sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabla */}
      {isLoading ? (
        <SkeletonTable rows={6} />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <EmptyState
            icon={Users}
            title="No se encontraron usuarios"
            description={search ? 'Probá con otra búsqueda.' : 'No hay usuarios con este filtro.'}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase">
                <th className="px-4 py-3 font-medium">Usuario</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Teléfono</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">País</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Registro</th>
                <th className="px-4 py-3 font-medium text-right">Gestión</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.admin
                const RoleIcon = roleConfig.icon
                const manageLink =
                  user.role === 'company'
                    ? '/admin/empresas'
                    : user.role === 'installer'
                    ? '/admin/instaladores'
                    : null
                return (
                  <tr key={user.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar fallback={user.full_name || user.email || '?'} src={user.avatar_url || undefined} size="sm" />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {user.full_name || 'Sin nombre'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', roleConfig.color)}>
                        <RoleIcon size={12} />
                        {roleConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                      {user.phone || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                      {user.country_code || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {manageLink ? (
                        <Link
                          href={manageLink}
                          className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 text-xs font-medium"
                        >
                          Gestionar
                          <ArrowRight size={12} />
                        </Link>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <p className="mt-3 text-xs text-gray-400">
          {filtered.length} usuario{filtered.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
