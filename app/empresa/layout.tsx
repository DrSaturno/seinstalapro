'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'

export default function EmpresaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout role="company">{children}</DashboardLayout>
}
