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
          'fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header del sidebar */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <Logo size="sm" />
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Badge de rol */}
        <div className="px-4 py-3">
          <span
            className={clsx(
              'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
              ROLE_COLORS[role]
            )}
          >
            {ROLE_LABELS[role]}
          </span>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {navigation.map((section, sIndex) => (
            <div key={sIndex} className="mb-2">
              {section.title && (
                <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {section.title}
                </p>
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/empresa/dashboard' &&
                      item.href !== '/instalador/dashboard' &&
                      item.href !== '/admin/dashboard' &&
                      pathname.startsWith(item.href))
                  const Icon = item.icon

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={clsx(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        )}
                      >
                        <Icon
                          className={clsx(
                            'h-5 w-5 flex-shrink-0',
                            isActive ? 'text-primary-500' : 'text-gray-400'
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
        <div className="px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            Se Instala Pro v0.1
          </p>
        </div>
      </aside>
    </>
  )
}
