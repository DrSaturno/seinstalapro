'use server'

// ============================================================
// SERVER ACTIONS - Equipo (invitaciones y membresías)
// La ÚNICA forma de que un instalador se sume a la plataforma
// es aceptando una invitación de una empresa.
// ============================================================

import { randomUUID } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import {
  inviteInstallerSchema,
  acceptInvitationSchema,
  type AcceptInvitationInput,
} from '@/lib/validations/auth'
import { createNotification } from '@/lib/actions/notifications'
import type { ActionResult } from '@/lib/actions/types'
import type {
  Invitation,
  TeamMembership,
  Installer,
  Profile,
} from '@/types/database'

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

async function requireCompany(): Promise<
  { userId: string; companyId: string; companyName: string } | { error: string }
> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  const { data: company } = await supabase
    .from('companies')
    .select('id, company_name, status')
    .eq('profile_id', user.id)
    .single()

  if (!company) return { error: 'No se encontró tu empresa' }
  if (company.status === 'suspended') {
    return { error: 'Tu empresa está suspendida. Contactá a soporte.' }
  }

  return { userId: user.id, companyId: company.id, companyName: company.company_name }
}

function invitationUrl(token: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${base}/invitaciones/${token}`
}

// ------------------------------------------------------------
// Empresa: invitar instalador
// ------------------------------------------------------------

export interface InviteResult extends ActionResult {
  inviteUrl?: string
}

export async function inviteInstaller(email: string): Promise<InviteResult> {
  const auth = await requireCompany()
  if ('error' in auth) return { success: false, error: auth.error }

  const validation = inviteInstallerSchema.safeParse({ email })
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message }
  }

  const normalizedEmail = validation.data.email.toLowerCase().trim()
  const adminClient = createAdminClient()

  // ¿El email pertenece a un usuario que NO es instalador? (empresa/admin)
  const { data: existingProfile } = await adminClient
    .from('profiles')
    .select('id, role')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (existingProfile && existingProfile.role !== 'installer') {
    return { success: false, error: 'Ese email pertenece a una cuenta que no es de instalador' }
  }

  // ¿Ya es miembro activo del equipo?
  if (existingProfile) {
    const { data: installer } = await adminClient
      .from('installers')
      .select('id')
      .eq('profile_id', existingProfile.id)
      .maybeSingle()

    if (installer) {
      const { data: membership } = await adminClient
        .from('team_memberships')
        .select('id, status')
        .eq('company_id', auth.companyId)
        .eq('installer_id', installer.id)
        .maybeSingle()

      if (membership?.status === 'active') {
        return { success: false, error: 'Ese instalador ya forma parte de tu equipo' }
      }
    }
  }

  // ¿Ya hay una invitación pendiente y vigente para este email?
  const { data: pendingInvite } = await adminClient
    .from('invitations')
    .select('id, token, expires_at')
    .eq('company_id', auth.companyId)
    .eq('email', normalizedEmail)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (pendingInvite) {
    return {
      success: true,
      message: 'Ya había una invitación pendiente para ese email. Compartí el link nuevamente.',
      inviteUrl: invitationUrl(pendingInvite.token),
    }
  }

  // Crear invitación
  const token = randomUUID()
  const { error: inviteError } = await adminClient.from('invitations').insert({
    company_id: auth.companyId,
    email: normalizedEmail,
    token,
    status: 'pending',
    invited_by: auth.userId,
  })

  if (inviteError) {
    return { success: false, error: 'Error al crear la invitación. Intentá de nuevo.' }
  }

  // Si el instalador ya tiene cuenta, avisarle también in-app
  if (existingProfile) {
    await createNotification({
      userId: existingProfile.id,
      type: 'invitation_received',
      title: 'Te invitaron a un equipo',
      message: `${auth.companyName} te invitó a sumarte a su equipo de instaladores.`,
      relatedEntityType: 'invitation',
    })
  }

  revalidatePath('/empresa/equipo')

  return {
    success: true,
    message: 'Invitación creada. Compartí el link con el instalador para que se sume a tu equipo.',
    inviteUrl: invitationUrl(token),
  }
}

// ------------------------------------------------------------
// Empresa: ver equipo e invitaciones
// ------------------------------------------------------------

export interface TeamMemberRow {
  membership: TeamMembership
  installer: Installer
  profile: Profile
}

export async function getCompanyTeam(): Promise<{
  success: boolean
  error?: string
  members?: TeamMemberRow[]
}> {
  const auth = await requireCompany()
  if ('error' in auth) return { success: false, error: auth.error }

  const supabase = createClient()

  const { data, error } = await supabase
    .from('team_memberships')
    .select('*, installer:installers(*, profile:profiles(*))')
    .eq('company_id', auth.companyId)
    .eq('status', 'active')
    .order('joined_at', { ascending: false })

  if (error) {
    return { success: false, error: 'Error al cargar el equipo' }
  }

  const members: TeamMemberRow[] = (data || [])
    .filter((row: any) => row.installer)
    .map((row: any) => {
      const { installer, ...membership } = row
      const { profile, ...installerData } = installer
      return { membership, installer: installerData, profile }
    })

  return { success: true, members }
}

export async function getPendingInvitations(): Promise<{
  success: boolean
  error?: string
  invitations?: Array<Invitation & { inviteUrl: string }>
}> {
  const auth = await requireCompany()
  if ('error' in auth) return { success: false, error: auth.error }

  const supabase = createClient()

  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('company_id', auth.companyId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    return { success: false, error: 'Error al cargar las invitaciones' }
  }

  const now = Date.now()
  const invitations = (data || [])
    .filter((inv: Invitation) => new Date(inv.expires_at).getTime() > now)
    .map((inv: Invitation) => ({ ...inv, inviteUrl: invitationUrl(inv.token) }))

  return { success: true, invitations }
}

export async function revokeInvitation(invitationId: string): Promise<ActionResult> {
  const auth = await requireCompany()
  if ('error' in auth) return { success: false, error: auth.error }

  const supabase = createClient()

  const { error } = await supabase
    .from('invitations')
    .update({ status: 'revoked' })
    .eq('id', invitationId)
    .eq('company_id', auth.companyId)
    .eq('status', 'pending')

  if (error) {
    return { success: false, error: 'Error al revocar la invitación' }
  }

  revalidatePath('/empresa/equipo')
  return { success: true, message: 'Invitación revocada' }
}

export async function removeTeamMember(installerId: string): Promise<ActionResult> {
  const auth = await requireCompany()
  if ('error' in auth) return { success: false, error: auth.error }

  const supabase = createClient()

  const { error } = await supabase
    .from('team_memberships')
    .update({ status: 'removed', removed_at: new Date().toISOString() })
    .eq('company_id', auth.companyId)
    .eq('installer_id', installerId)
    .eq('status', 'active')

  if (error) {
    return { success: false, error: 'Error al quitar al instalador del equipo' }
  }

  revalidatePath('/empresa/equipo')
  return { success: true, message: 'Instalador quitado del equipo' }
}

// ------------------------------------------------------------
// Página pública de invitación: leer por token
// ------------------------------------------------------------

export interface InvitationInfo {
  valid: boolean
  reason?: string
  email?: string
  companyName?: string
  // 'new_account' = mini-signup; 'existing_login' = debe iniciar sesión;
  // 'existing_ready' = logueado con la cuenta correcta, puede aceptar directo
  mode?: 'new_account' | 'existing_login' | 'existing_ready'
}

export async function getInvitationByToken(token: string): Promise<InvitationInfo> {
  if (!token) return { valid: false, reason: 'Invitación inválida' }

  const adminClient = createAdminClient()

  const { data: invitation } = await adminClient
    .from('invitations')
    .select('*, company:companies(company_name)')
    .eq('token', token)
    .maybeSingle()

  if (!invitation) return { valid: false, reason: 'La invitación no existe' }
  if (invitation.status === 'accepted') return { valid: false, reason: 'Esta invitación ya fue usada' }
  if (invitation.status === 'revoked') return { valid: false, reason: 'Esta invitación fue revocada' }
  if (new Date(invitation.expires_at).getTime() < Date.now()) {
    return { valid: false, reason: 'Esta invitación expiró. Pedile a la empresa que te envíe una nueva.' }
  }

  const companyName = (invitation as any).company?.company_name

  // ¿Existe ya una cuenta con ese email?
  const { data: existingProfile } = await adminClient
    .from('profiles')
    .select('id, role')
    .eq('email', invitation.email)
    .maybeSingle()

  if (!existingProfile) {
    return { valid: true, email: invitation.email, companyName, mode: 'new_account' }
  }

  // ¿El visitante actual está logueado con esa cuenta?
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user && user.id === existingProfile.id) {
    return { valid: true, email: invitation.email, companyName, mode: 'existing_ready' }
  }

  return { valid: true, email: invitation.email, companyName, mode: 'existing_login' }
}

// ------------------------------------------------------------
// Aceptar invitación
// ------------------------------------------------------------

async function activateMembership(params: {
  invitationId: string
  companyId: string
  installerId: string
  installerProfileId: string
  companyOwnerProfileId: string
  installerName: string
}): Promise<ActionResult> {
  const adminClient = createAdminClient()

  // Reactivar membresía previa (removed) o crear una nueva
  const { data: existing } = await adminClient
    .from('team_memberships')
    .select('id, status')
    .eq('company_id', params.companyId)
    .eq('installer_id', params.installerId)
    .maybeSingle()

  if (existing?.status === 'active') {
    // Ya era miembro: solo cerrar la invitación
  } else if (existing) {
    const { error } = await adminClient
      .from('team_memberships')
      .update({ status: 'active', joined_at: new Date().toISOString(), removed_at: null })
      .eq('id', existing.id)
    if (error) return { success: false, error: 'Error al activar la membresía' }
  } else {
    const { error } = await adminClient.from('team_memberships').insert({
      company_id: params.companyId,
      installer_id: params.installerId,
      status: 'active',
    })
    if (error) return { success: false, error: 'Error al crear la membresía' }
  }

  await adminClient
    .from('invitations')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString(),
      installer_id: params.installerId,
    })
    .eq('id', params.invitationId)

  await createNotification({
    userId: params.companyOwnerProfileId,
    type: 'team_joined',
    title: 'Nuevo instalador en tu equipo',
    message: `${params.installerName} aceptó tu invitación y se sumó a tu equipo.`,
    relatedEntityType: 'team_membership',
  })

  return { success: true }
}

// Camino A: el instalador YA tiene cuenta y está logueado con ella
export async function acceptInvitationExisting(token: string): Promise<ActionResult> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Tenés que iniciar sesión para aceptar la invitación' }

  const adminClient = createAdminClient()

  const { data: invitation } = await adminClient
    .from('invitations')
    .select('*, company:companies(id, company_name, profile_id)')
    .eq('token', token)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (!invitation) return { success: false, error: 'La invitación no es válida o expiró' }

  const { data: profile } = await adminClient
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.email.toLowerCase() !== invitation.email.toLowerCase()) {
    return { success: false, error: 'Esta invitación es para otro email. Iniciá sesión con la cuenta invitada.' }
  }
  if (profile.role !== 'installer') {
    return { success: false, error: 'Esta invitación es para una cuenta de instalador' }
  }

  const { data: installer } = await adminClient
    .from('installers')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!installer) return { success: false, error: 'No se encontró tu perfil de instalador' }

  const company = (invitation as any).company
  const result = await activateMembership({
    invitationId: invitation.id,
    companyId: company.id,
    installerId: installer.id,
    installerProfileId: user.id,
    companyOwnerProfileId: company.profile_id,
    installerName: profile.full_name,
  })

  if (!result.success) return result

  revalidatePath('/instalador/dashboard')
  return { success: true, message: `Te sumaste al equipo de ${company.company_name}` }
}

// Camino B: el instalador NO tiene cuenta — mini-signup atado a la invitación
export async function acceptInvitationNew(
  token: string,
  data: AcceptInvitationInput
): Promise<ActionResult> {
  const validation = acceptInvitationSchema.safeParse(data)
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message }
  }

  const { full_name, password, country_code } = validation.data
  const adminClient = createAdminClient()

  const { data: invitation } = await adminClient
    .from('invitations')
    .select('*, company:companies(id, company_name, profile_id)')
    .eq('token', token)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (!invitation) return { success: false, error: 'La invitación no es válida o expiró' }

  // Si ya existe cuenta con ese email, este camino no corresponde
  const { data: existingProfile } = await adminClient
    .from('profiles')
    .select('id')
    .eq('email', invitation.email)
    .maybeSingle()

  if (existingProfile) {
    return { success: false, error: 'Ya existe una cuenta con ese email. Iniciá sesión para aceptar la invitación.' }
  }

  // Crear usuario confirmado (el link de invitación ya valida el email)
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: invitation.email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role: 'installer', country_code },
  })

  if (authError || !authData.user) {
    return { success: false, error: `Error al crear la cuenta: ${authError?.message}` }
  }

  const { error: profileError } = await adminClient.from('profiles').insert({
    id: authData.user.id,
    role: 'installer',
    full_name,
    email: invitation.email,
    country_code,
    status: 'active',
  })

  if (profileError) {
    await adminClient.auth.admin.deleteUser(authData.user.id)
    return { success: false, error: 'Error al crear el perfil. Intentá de nuevo.' }
  }

  // Sin moderación central: el instalador queda aprobado al aceptar la invitación
  const { data: installer, error: installerError } = await adminClient
    .from('installers')
    .insert({
      profile_id: authData.user.id,
      country: country_code,
      status: 'approved',
      approved_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (installerError || !installer) {
    await adminClient.from('profiles').delete().eq('id', authData.user.id)
    await adminClient.auth.admin.deleteUser(authData.user.id)
    return { success: false, error: 'Error al crear el perfil de instalador. Intentá de nuevo.' }
  }

  const company = (invitation as any).company
  const result = await activateMembership({
    invitationId: invitation.id,
    companyId: company.id,
    installerId: installer.id,
    installerProfileId: authData.user.id,
    companyOwnerProfileId: company.profile_id,
    installerName: full_name,
  })

  if (!result.success) return result

  return {
    success: true,
    message: `Cuenta creada. Ya formás parte del equipo de ${company.company_name}. Iniciá sesión para continuar.`,
  }
}
