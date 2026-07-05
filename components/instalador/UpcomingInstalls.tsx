'use client'

import Link from 'next/link'
import {
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  Snowflake,
  CloudFog,
  MapPin,
  Building2,
  CalendarDays,
  Umbrella,
} from 'lucide-react'
import { formatDate } from '@/lib/utils/format'
import type { UpcomingInstallation } from '@/lib/actions/weather'
import type { WeatherKind } from '@/lib/utils/weather'
import type { LucideIcon } from 'lucide-react'

const WEATHER_ICONS: Record<WeatherKind, { icon: LucideIcon; color: string }> = {
  sun: { icon: Sun, color: 'text-amber-500' },
  cloud: { icon: Cloud, color: 'text-slate-400' },
  rain: { icon: CloudRain, color: 'text-blue-500' },
  storm: { icon: CloudLightning, color: 'text-violet-500' },
  snow: { icon: Snowflake, color: 'text-sky-400' },
  fog: { icon: CloudFog, color: 'text-slate-400' },
}

interface UpcomingInstallsProps {
  installations: UpcomingInstallation[]
}

export function UpcomingInstalls({ installations }: UpcomingInstallsProps) {
  if (installations.length === 0) return null

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Próximas instalaciones
      </h2>
      <div className="space-y-3">
        {installations.map((install) => {
          const weatherConfig = install.weather
            ? WEATHER_ICONS[install.weather.kind]
            : null
          const WeatherIcon = weatherConfig?.icon

          return (
            <Link
              key={install.agreementId}
              href="/instalador/acuerdos"
              className="block bg-white rounded-2xl border border-slate-100 p-5 shadow-sm shadow-slate-100/30 hover:border-primary-200 hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-800 truncate">
                    {install.jobTitle}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Building2 size={12} />
                      {install.companyName}
                    </span>
                    {install.city && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {install.city}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-primary-600 font-semibold">
                      <CalendarDays size={12} />
                      {formatDate(install.startDate)}
                      {install.endDate ? ` — ${formatDate(install.endDate)}` : ''}
                    </span>
                  </div>
                </div>

                {/* Pronóstico */}
                {install.weather && WeatherIcon && (
                  <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 shrink-0">
                    <WeatherIcon size={22} className={weatherConfig.color} />
                    <div className="text-xs">
                      <p className="font-bold text-slate-700">
                        {install.weather.label}
                      </p>
                      <p className="text-slate-400 font-medium">
                        {install.weather.tempMax}° / {install.weather.tempMin}°
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Aviso de lluvia */}
              {install.weather?.rainRisk && (
                <div className="mt-3 flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-xs font-semibold text-blue-800">
                  <Umbrella size={14} className="shrink-0" />
                  <span>
                    Riesgo de lluvia ({install.weather.precipProbability}% de
                    probabilidad): si la instalación es exterior, coordiná un
                    plan B con la empresa.
                  </span>
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
