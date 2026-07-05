'use client'

import { Building2, MapPin } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { formatDate } from '@/lib/utils/format'
import type { MyTeam } from '@/lib/actions/types'

const COUNTRY_NAMES: Record<string, string> = {
  AR: 'Argentina',
  BR: 'Brasil',
}

interface MyTeamsListProps {
  teams: MyTeam[]
}

export function MyTeamsList({ teams }: MyTeamsListProps) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Mis equipos</h2>

      {teams.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
          <div className="w-12 h-12 mx-auto bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center mb-3">
            <Building2 className="h-6 w-6 text-slate-300" />
          </div>
          <p className="text-sm font-medium text-slate-600">
            Todavía no formás parte de ningún equipo
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Cuando una empresa te envíe una invitación y la aceptes, va a aparecer acá.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {teams.map((team) => (
            <div
              key={team.membershipId}
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm shadow-slate-100/30 flex items-center gap-4"
            >
              <Avatar
                src={team.logoUrl}
                alt={team.companyName}
                fallback={team.companyName}
                size="lg"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 truncate">
                  {team.companyName}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <MapPin size={12} className="shrink-0" />
                  <span className="truncate">
                    {[team.city, COUNTRY_NAMES[team.country] || team.country]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Miembro desde {formatDate(team.joinedAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
