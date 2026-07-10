'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, LogOut, User, ChevronDown } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { Avatar } from '@/components/ui/Avatar'
import { NotificationDropdown } from '@/components/layout/NotificationDropdown'
import { ROLE_LABELS } from '@/lib/navigation'

interface TopbarProps {
  onMenuToggle: () => void
}

export function Topbar({ onMenuToggle }: TopbarProps) {
  const { profile, user } = useAuth()
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    setIsDropdownOpen(false)
    // Logout server-side: la ruta borra las cookies de auth en la respuesta.
    // Navegación plena a propósito — no depende del cliente de Supabase
    // (que puede colgarse esperando el auth lock) ni del estado de React.
    window.location.replace('/auth/signout')
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Usuario'
  const roleLabel = profile?.role ? ROLE_LABELS[profile.role] : ''

  return (
    <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 shadow-premium">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Izquierda: Hamburger + Título */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50/80 transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
 
        {/* Derecha: Notificaciones + Perfil */}
        <div className="flex items-center gap-2">
          {/* Notificaciones */}
          <NotificationDropdown />
 
          {/* Perfil dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-50/80 border border-transparent hover:border-slate-200/40 transition-all duration-200"
            >
              <Avatar
                src={profile?.avatar_url}
                fallback={displayName}
                size="sm"
              />
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-slate-800 leading-tight">
                  {displayName}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 leading-none">
                  {roleLabel}
                </p>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
 
            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2.5 w-60 bg-white rounded-2xl shadow-premium-hover border border-slate-200/50 p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Info del usuario */}
                <div className="px-4 py-3.5 border-b border-slate-100/50 bg-slate-50/50 rounded-xl mb-1.5">
                  <p className="text-sm font-bold text-slate-800">
                    {displayName}
                  </p>
                  <p className="text-xs text-slate-500 truncate mt-1">
                    {user?.email}
                  </p>
                </div>
 
                {/* Links */}
                <button
                  onClick={() => {
                    setIsDropdownOpen(false)
                    const profilePath =
                      profile?.role === 'company'
                        ? '/empresa/perfil'
                        : profile?.role === 'installer'
                        ? '/instalador/perfil'
                        : '/admin/configuracion'
                    router.push(profilePath)
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors rounded-xl text-left"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  Mi perfil
                </button>
 
                <div className="border-t border-slate-100/50 my-1.5" />
 
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50/80 transition-colors rounded-xl text-left"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
