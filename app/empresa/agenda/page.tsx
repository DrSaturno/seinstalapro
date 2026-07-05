'use client'

// ============================================================
// AGENDA DE INSTALACIONES (empresa)
// Calendario mensual con los acuerdos que tienen fecha
// confirmada. Click en una entrada → acuerdos.
// ============================================================

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { clsx } from 'clsx'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { getCompanyAgreements } from '@/lib/actions/agreements'
import {
  getMonthGrid,
  occursOnDay,
  MONTH_NAMES_ES,
  WEEKDAY_NAMES_ES,
} from '@/lib/utils/calendar'
import type { AgreementFull } from '@/lib/actions/types'

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  in_progress: 'bg-purple-100 text-purple-700 border-purple-200',
  coordinating: 'bg-amber-100 text-amber-700 border-amber-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

export default function EmpresaAgendaPage() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [agreements, setAgreements] = useState<AgreementFull[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getCompanyAgreements()
      .then((data) =>
        setAgreements(data.filter((a) => a.confirmed_start_date))
      )
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const grid = useMemo(() => getMonthGrid(year, month), [year, month])
  const todayISO = today.toISOString().slice(0, 10)

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11)
      setYear((y) => y - 1)
    } else {
      setMonth((m) => m - 1)
    }
  }

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0)
      setYear((y) => y + 1)
    } else {
      setMonth((m) => m + 1)
    }
  }

  const entriesForDay = (dayISO: string) =>
    agreements.filter((a) =>
      occursOnDay(a.confirmed_start_date!, a.confirmed_end_date || undefined, dayISO)
    )

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Agenda de instalaciones"
        description="Todas tus instalaciones con fecha confirmada, mes por mes"
      />

      {/* Navegación de mes */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
          aria-label="Mes anterior"
        >
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-lg font-bold text-slate-800">
          {MONTH_NAMES_ES[month]} {year}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
          aria-label="Mes siguiente"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {isLoading ? (
        <div className="h-96 bg-white border border-slate-100 rounded-2xl animate-pulse" />
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
          {/* Encabezado de días */}
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
            {WEEKDAY_NAMES_ES.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Semanas */}
          {grid.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 border-b border-slate-50 last:border-b-0">
              {week.map((day) => {
                const entries = entriesForDay(day.iso)
                const isToday = day.iso === todayISO
                return (
                  <div
                    key={day.iso}
                    className={clsx(
                      'min-h-[90px] p-1.5 border-r border-slate-50 last:border-r-0',
                      !day.inMonth && 'bg-slate-50/40'
                    )}
                  >
                    <span
                      className={clsx(
                        'inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full',
                        isToday
                          ? 'bg-primary-600 text-white'
                          : day.inMonth
                            ? 'text-slate-600'
                            : 'text-slate-300'
                      )}
                    >
                      {day.dayOfMonth}
                    </span>

                    <div className="mt-1 space-y-1">
                      {entries.slice(0, 3).map((a) => {
                        const job = a.job as any
                        const installer = (a.installer as any)?.profile?.full_name
                        return (
                          <Link
                            key={a.id}
                            href="/empresa/acuerdos"
                            title={`${job?.title || 'Trabajo'}${installer ? ` — ${installer}` : ''}`}
                            className={clsx(
                              'block text-[10px] font-semibold px-1.5 py-0.5 rounded border truncate hover:opacity-80 transition-opacity',
                              STATUS_COLORS[a.status] ||
                                'bg-slate-100 text-slate-600 border-slate-200'
                            )}
                          >
                            {job?.title || 'Trabajo'}
                          </Link>
                        )
                      })}
                      {entries.length > 3 && (
                        <span className="block text-[10px] text-slate-400 font-semibold px-1.5">
                          +{entries.length - 3} más
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}

      {/* Empty state global */}
      {!isLoading && agreements.length === 0 && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200">
          <EmptyState
            icon={CalendarDays}
            title="Sin instalaciones agendadas"
            description="Cuando confirmes fechas en tus acuerdos, van a aparecer en este calendario."
          />
        </div>
      )}

      {/* Referencias */}
      <div className="flex flex-wrap gap-3 mt-4 text-[11px] font-semibold">
        {[
          ['coordinating', 'Coordinando'],
          ['confirmed', 'Confirmado'],
          ['in_progress', 'En progreso'],
          ['completed', 'Entregado'],
        ].map(([status, label]) => (
          <span
            key={status}
            className={clsx(
              'px-2 py-0.5 rounded border',
              STATUS_COLORS[status]
            )}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
