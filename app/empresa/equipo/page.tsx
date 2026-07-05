'use client'

import { useEffect, useState } from 'react'
import { Users, UserPlus, Mail, Copy, Check, Star, XCircle } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonCardList } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import {
  getCompanyTeam,
  getPendingInvitations,
  inviteInstaller,
  revokeInvitation,
  removeTeamMember,
  type TeamMemberRow,
} from '@/lib/actions/team'
import type { Invitation } from '@/types/database'
import { formatRelativeDate } from '@/lib/utils/format'
import { toast } from 'sonner'

export default function EmpresaEquipoPage() {
  const [members, setMembers] = useState<TeamMemberRow[]>([])
  const [invitations, setInvitations] = useState<Array<Invitation & { inviteUrl: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [isInviting, setIsInviting] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [actioningId, setActioningId] = useState<string | null>(null)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [teamResult, invitesResult] = await Promise.all([
        getCompanyTeam(),
        getPendingInvitations(),
      ])
      if (teamResult.success) setMembers(teamResult.members || [])
      if (invitesResult.success) setInvitations(invitesResult.invitations || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setIsInviting(true)
    try {
      const result = await inviteInstaller(inviteEmail.trim())
      if (result.success) {
        toast.success(result.message)
        setInviteEmail('')
        setShowInvite(false)
        loadData()
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error('Error inesperado. Intentá de nuevo.')
    } finally {
      setIsInviting(false)
    }
  }

  const handleCopyLink = async (inv: Invitation & { inviteUrl: string }) => {
    await navigator.clipboard.writeText(inv.inviteUrl)
    setCopiedId(inv.id)
    toast.success('Link copiado. Compartilo con el instalador.')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleRevoke = async (invitationId: string) => {
    setActioningId(invitationId)
    try {
      const result = await revokeInvitation(invitationId)
      if (result.success) {
        toast.success(result.message)
        loadData()
      } else {
        toast.error(result.error)
      }
    } finally {
      setActioningId(null)
    }
  }

  const handleRemove = async (installerId: string, name: string) => {
    if (!confirm(`¿Quitar a ${name} de tu equipo? No va a poder ver más tus trabajos.`)) return
    setActioningId(installerId)
    try {
      const result = await removeTeamMember(installerId)
      if (result.success) {
        toast.success(result.message)
        loadData()
      } else {
        toast.error(result.error)
      }
    } finally {
      setActioningId(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Mi equipo"
        description="Gestioná los instaladores de tu equipo e invitá nuevos"
        actions={
          <Button onClick={() => setShowInvite(!showInvite)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invitar instalador
          </Button>
        }
      />

      {/* Formulario de invitación */}
      {showInvite && (
        <form
          onSubmit={handleInvite}
          className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row gap-3 sm:items-end"
        >
          <div className="flex-1">
            <Input
              label="Email del instalador"
              type="email"
              placeholder="instalador@email.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>
          <Button type="submit" isLoading={isInviting}>
            <Mail className="h-4 w-4 mr-2" />
            Crear invitación
          </Button>
        </form>
      )}

      {isLoading ? (
        <SkeletonCardList count={3} />
      ) : (
        <div className="space-y-8">
          {/* Invitaciones pendientes */}
          {invitations.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Invitaciones pendientes
              </h2>
              <div className="space-y-3">
                {invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{inv.email}</p>
                      <p className="text-xs text-gray-500">
                        Enviada {formatRelativeDate(inv.created_at)} · Expira{' '}
                        {formatRelativeDate(inv.expires_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="warning">Pendiente</Badge>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCopyLink(inv)}
                      >
                        {copiedId === inv.id ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        <span className="ml-1.5">Copiar link</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        isLoading={actioningId === inv.id}
                        onClick={() => handleRevoke(inv.id)}
                      >
                        <XCircle className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Miembros del equipo */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Instaladores activos ({members.length})
            </h2>
            {members.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Todavía no tenés instaladores en tu equipo"
                description="Invitá a tu primer instalador con el botón de arriba. Solo pueden sumarse por invitación."
              />
            ) : (
              <div className="space-y-3">
                {members.map(({ membership, installer, profile }) => (
                  <div
                    key={membership.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar
                        src={profile.avatar_url}
                        alt={profile.full_name}
                        fallback={profile.full_name}
                        size="md"
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {profile.full_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{profile.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {installer.total_reviews > 0 && (
                        <span className="flex items-center gap-1 text-sm text-gray-600">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          {Number(installer.avg_rating).toFixed(1)}
                          <span className="text-gray-400">({installer.total_reviews})</span>
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        En el equipo desde {formatRelativeDate(membership.joined_at || membership.created_at)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        isLoading={actioningId === installer.id}
                        onClick={() => handleRemove(installer.id, profile.full_name)}
                      >
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="ml-1 text-red-500">Quitar</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
