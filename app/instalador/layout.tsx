'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'

export default function InstaladorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout role="installer">{children}</DashboardLayout>
}
