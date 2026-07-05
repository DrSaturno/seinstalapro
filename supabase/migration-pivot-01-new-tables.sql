-- ============================================================
-- PIVOT B2B SAAS - 01: NEW TABLES (team_memberships, invitations)
-- ============================================================

CREATE TYPE public.team_membership_status AS ENUM ('active', 'removed');
CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'expired', 'revoked');

-- ============================================================
-- TEAM MEMBERSHIPS (installer <-> company, many-to-many)
-- ============================================================

CREATE TABLE public.team_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  installer_id UUID NOT NULL REFERENCES public.installers(id) ON DELETE CASCADE,
  status public.team_membership_status NOT NULL DEFAULT 'active',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  removed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(company_id, installer_id)
);

CREATE INDEX idx_team_memberships_company_id ON public.team_memberships(company_id);
CREATE INDEX idx_team_memberships_installer_id ON public.team_memberships(installer_id);
CREATE INDEX idx_team_memberships_status ON public.team_memberships(status);

CREATE TRIGGER update_team_memberships_updated_at
BEFORE UPDATE ON public.team_memberships
FOR EACH ROW
EXECUTE FUNCTION moddatetime (updated_at);

-- ============================================================
-- INVITATIONS (company invites an installer by email)
-- ============================================================

CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status public.invitation_status NOT NULL DEFAULT 'pending',
  invited_by UUID NOT NULL REFERENCES public.profiles(id),
  installer_id UUID REFERENCES public.installers(id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invitations_company_id ON public.invitations(company_id);
CREATE INDEX idx_invitations_token ON public.invitations(token);
CREATE INDEX idx_invitations_email ON public.invitations(email);
CREATE INDEX idx_invitations_status ON public.invitations(status);

-- ============================================================
-- COMPANIES: audit trail of superadmin-created accounts
-- ============================================================

ALTER TABLE public.companies ADD COLUMN created_by_superadmin_id UUID REFERENCES public.profiles(id);
