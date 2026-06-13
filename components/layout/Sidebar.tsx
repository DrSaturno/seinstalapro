'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import { Logo } from '@/components/ui/Logo'
import { getNavigation, ROLE_LABELS, ROLE_COLORS } from '@/lib/navigation'
import { Badge } from '@/components/ui/Badge'
import type { UserRole } from '@/types/database'
import { X } from 'lucide-react'

interface SidebarProps {
  role: UserRole
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const navigation = getNavigation(role)

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto shadow-sm lg:shadow-none',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header del sidebar */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-50">
          <Logo size="sm" />
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
 
        {/* Badge de rol */}
        <div className="px-5 py-3">
          <span
            className={clsx(
              'inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold border',
              role === 'company' && 'bg-blue-50 text-blue-700 border-blue-100/50',
              role === 'installer' && 'bg-amber-50 text-amber-700 border-amber-100/50',
              role === 'admin' && 'bg-purple-50 text-purple-700 border-purple-100/50',
              role === 'superadmin' && 'bg-red-50 text-red-700 border-red-100/50'
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse bg-current" />
            {ROLE_LABELS[role]}
          </span>
        </div>
 
        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto px-4 pb-4 mt-2">
          {navigation.map((section, sIndex) => (
            <div key={sIndex} className="mb-4">
              {section.title && (
                <p className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  {section.title}
                </p>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/empresa/dashboard' &&
                      item.href !== '/instalador/dashboard' &&
                      item.href !== '/admin/dashboard' &&
                      pathname.startsWith(item.href))
                  const Icon = item.icon
 
                  return (
                    <li key={item.href} className="relative">
                      {isActive && (
                        <span className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-primary-600 rounded-r-full" />
                      )}
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={clsx(
                          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'bg-primary-50 text-primary-700 font-semibold'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                        )}
                      >
                        <Icon
                          className={clsx(
                            'h-5 w-5 flex-shrink-0 transition-colors',
                            isActive ? 'text-primary-600' : 'text-slate-400'
                          )}
                        />
                        <span className="flex-1">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <Badge variant="danger">{item.badge}</Badge>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
 
        {/* Footer del sidebar */}
        <div className="px-5 py-4 border-t border-slate-50">
          <p className="text-[10px] font-medium text-slate-400 text-center tracking-wider">
            SE INSTALA PRO &bull; v0.1
          </p>
        </div>
      </aside>
    </>
  )
}
