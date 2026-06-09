// ============================================================
// NAVEGACIÓN - Configuración de menús por rol
// ============================================================

import {
  LayoutDashboard,
  Briefcase,
  FileText,
  MessageSquare,
  Building2,
  Wrench,
  Users,
  Shield,
  Star,
  Settings,
  AlertTriangle,
  Search,
  ClipboardList,
  FileCheck2,
  UserCircle,
  type LucideIcon,
} from 'lucide-react'
import type { UserRole } from '@/types/database'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: number
}

export interface NavSection {
  title?: string
  items: NavItem[]
}

// --- Empresa ---
const empresaNav: NavSection[] = [
  {
    items: [
      { label: 'Dashboard', href: '/empresa/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Trabajos',
    items: [
      { label: 'Mis trabajos', href: '/empresa/trabajos', icon: Briefcase },
      { label: 'Publicar trabajo', href: '/empresa/trabajos/nuevo', icon: FileText },
    ],
  },
  {
    title: 'Gestión',
    items: [
      { label: 'Ofertas recibidas', href: '/empresa/ofertas', icon: ClipboardList },
      { label: 'Acuerdos', href: '/empresa/acuerdos', icon: FileCheck2 },
      { label: 'Mensajes', href: '/empresa/mensajes', icon: MessageSquare },
    ],
  },
  {
    title: 'Cuenta',
    items: [
      { label: 'Mi empresa', href: '/empresa/perfil', icon: Building2 },
      { label: 'Configuración', href: '/empresa/configuracion', icon: Settings },
    ],
  },
]

// --- Instalador ---
const instaladorNav: NavSection[] = [
  {
    items: [
      { label: 'Dashboard', href: '/instalador/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Trabajos',
    items: [
      { label: 'Buscar trabajos', href: '/instalador/trabajos', icon: Search },
    ],
  },
  {
    title: 'Gestión',
    items: [
      { label: 'Mis ofertas', href: '/instalador/ofertas', icon: ClipboardList },
      { label: 'Acuerdos', href: '/instalador/acuerdos', icon: FileCheck2 },
      { label: 'Mensajes', href: '/instalador/mensajes', icon: MessageSquare },
      { label: 'Reseñas', href: '/instalador/resenas', icon: Star },
    ],
  },
  {
    title: 'Cuenta',
    items: [
      { label: 'Mi perfil', href: '/instalador/perfil', icon: UserCircle },
      { label: 'Configuración', href: '/instalador/configuracion', icon: Settings },
    ],
  },
]

// --- Admin ---
const adminNav: NavSection[] = [
  {
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Moderación',
    items: [
      { label: 'Empresas', href: '/admin/empresas', icon: Building2 },
      { label: 'Instaladores', href: '/admin/instaladores', icon: Wrench },
      { label: 'Trabajos', href: '/admin/trabajos', icon: Briefcase },
    ],
  },
  {
    title: 'Soporte',
    items: [
      { label: 'Disputas', href: '/admin/disputas', icon: AlertTriangle },
      { label: 'Usuarios', href: '/admin/usuarios', icon: Users },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { label: 'Auditoría', href: '/admin/auditoria', icon: Shield },
      { label: 'Configuración', href: '/admin/configuracion', icon: Settings },
    ],
  },
]

// Mapeo de rol a navegación
const NAV_BY_ROLE: Record<string, NavSection[]> = {
  company: empresaNav,
  installer: instaladorNav,
  admin: adminNav,
  superadmin: adminNav,
}

export function getNavigation(role: UserRole): NavSection[] {
  return NAV_BY_ROLE[role] || []
}

// Títulos de rol para mostrar en UI
export const ROLE_LABELS: Record<UserRole, string> = {
  company: 'Empresa',
  installer: 'Instalador',
  admin: 'Administrador',
  superadmin: 'Super Admin',
}

// Colores de rol para badges/indicadores
export const ROLE_COLORS: Record<UserRole, string> = {
  company: 'bg-primary-100 text-primary-700',
  installer: 'bg-accent-100 text-accent-700',
  admin: 'bg-purple-100 text-purple-700',
  superadmin: 'bg-red-100 text-red-700',
}
