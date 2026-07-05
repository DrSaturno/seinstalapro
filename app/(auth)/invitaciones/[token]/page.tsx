import type { Metadata } from 'next'
import { getInvitationByToken } from '@/lib/actions/team'
import { AcceptInvitationForm } from '@/components/auth/AcceptInvitationForm'
import { Alert } from '@/components/ui/Alert'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Invitación a equipo - Se Instala Pro',
  description: 'Aceptá la invitación para sumarte a un equipo de instaladores',
}

export default async function InvitationPage({
  params,
}: {
  params: { token: string }
}) {
  const invitation = await getInvitationByToken(params.token)

  if (!invitation.valid) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">
          Invitación no válida
        </h1>
        <Alert variant="error">{invitation.reason}</Alert>
        <p className="text-center text-sm text-gray-600 mt-6">
          <Link
            href="/login"
            className="text-primary-500 font-medium hover:text-primary-600 hover:underline"
          >
            Ir a iniciar sesión
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
        Te invitaron a un equipo
      </h1>
      <p className="text-sm text-gray-600 text-center mb-6">
        <span className="font-semibold">{invitation.companyName}</span> te invitó a
        sumarte a su equipo de instaladores en Se Instala Pro
      </p>
      <AcceptInvitationForm
        token={params.token}
        email={invitation.email!}
        companyName={invitation.companyName || 'la empresa'}
        mode={invitation.mode!}
      />
    </div>
  )
}
