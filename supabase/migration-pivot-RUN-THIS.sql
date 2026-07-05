-- ============================================================
-- PIVOT B2B SAAS - MIGRACIÓN CONSOLIDADA (01 + 05)
-- Pegar COMPLETO en el SQL Editor de Supabase y ejecutar UNA vez.
-- Idempotente: si falla a mitad de camino, se puede volver a correr.
-- ============================================================

-- ------------------------------------------------------------
-- PARTE A (= migration-pivot-01): tablas nuevas
-- ------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE public.team_membership_status AS ENUM ('active', 'removed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'expired', 'revoked');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Team memberships (instalador <-> empresa, many-to-many)
CREATE TABLE IF NOT EXISTS public.team_memberships (
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

CREATE INDEX IF NOT EXISTS idx_team_memberships_company_id ON public.team_memberships(company_id);
CREATE INDEX IF NOT EXISTS idx_team_memberships_installer_id ON public.team_memberships(installer_id);
CREATE INDEX IF NOT EXISTS idx_team_memberships_status ON public.team_memberships(status);

DROP TRIGGER IF EXISTS update_team_memberships_updated_at ON public.team_memberships;
CREATE TRIGGER update_team_memberships_updated_at
BEFORE UPDATE ON public.team_memberships
FOR EACH ROW
EXECUTE FUNCTION moddatetime (updated_at);

-- Invitations (la empresa invita a un instalador por email)
CREATE TABLE IF NOT EXISTS public.invitations (
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

CREATE INDEX IF NOT EXISTS idx_invitations_company_id ON public.invitations(company_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.invitations(status);

-- Auditoría: qué superadmin creó cada empresa
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS created_by_superadmin_id UUID REFERENCES public.profiles(id);

-- ------------------------------------------------------------
-- PARTE B (= migration-pivot-05): drop offers, enum swap, RLS
-- ------------------------------------------------------------

-- STEP 1: drop de policies que referencian jobs.status u offers
DROP POLICY IF EXISTS "jobs_select_company_admin_or_published" ON public.jobs;
DROP POLICY IF EXISTS "jobs_select_company_admin_assigned_or_team_open" ON public.jobs;
DROP POLICY IF EXISTS "job_files_select_company_admin_or_published" ON public.job_files;
DROP POLICY IF EXISTS "job_files_select_company_admin_assigned_or_team_open" ON public.job_files;

-- STEP 2: eliminar tabla offers + enum
DROP TABLE IF EXISTS public.offers CASCADE;
DROP TYPE IF EXISTS public.offer_status;

-- STEP 3: swap del enum job_status (solo si todavía tiene valores viejos)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'job_status' AND e.enumlabel = 'receiving_offers'
  ) THEN
    CREATE TYPE public.job_status_new AS ENUM (
      'draft', 'pending_admin_approval', 'published', 'assigned',
      'coordinating', 'confirmed', 'in_progress',
      'completed_by_installer', 'under_company_review', 'approved', 'rated',
      'cancelled', 'disputed'
    );

    ALTER TABLE public.jobs ALTER COLUMN status DROP DEFAULT;

    ALTER TABLE public.jobs
      ALTER COLUMN status TYPE public.job_status_new
      USING (
        CASE status::text
          WHEN 'receiving_offers' THEN 'published'
          WHEN 'offer_accepted' THEN 'assigned'
          ELSE status::text
        END
      )::public.job_status_new;

    ALTER TABLE public.jobs ALTER COLUMN status SET DEFAULT 'draft';

    DROP TYPE public.job_status;
    ALTER TYPE public.job_status_new RENAME TO job_status;
  END IF;
END $$;

-- STEP 4: cambios de columnas en jobs / agreements / companies
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS claimed_by_installer_id UUID REFERENCES public.installers(id);
CREATE INDEX IF NOT EXISTS idx_jobs_claimed_by_installer_id ON public.jobs(claimed_by_installer_id);
ALTER TABLE public.jobs DROP COLUMN IF EXISTS offers_count;

COMMENT ON COLUMN public.jobs.budget_min IS 'Optional internal cost note (not a payment feature).';
COMMENT ON COLUMN public.jobs.budget_max IS 'Optional internal cost note (not a payment feature).';

ALTER TABLE public.agreements DROP COLUMN IF EXISTS offer_id;
COMMENT ON COLUMN public.agreements.final_price IS 'Optional internal cost note (not a payment feature).';

ALTER TABLE public.companies ALTER COLUMN status SET DEFAULT 'verified';

-- STEP 5: funciones helper
CREATE OR REPLACE FUNCTION public.is_team_member(target_company_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_memberships tm
    JOIN public.installers i ON i.id = tm.installer_id
    WHERE tm.company_id = target_company_id
      AND i.profile_id = auth.uid()
      AND tm.status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.my_team_company_ids()
RETURNS SETOF UUID
LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT tm.company_id FROM public.team_memberships tm
  JOIN public.installers i ON i.id = tm.installer_id
  WHERE i.profile_id = auth.uid() AND tm.status = 'active';
$$;

-- STEP 6: RLS en tablas nuevas + reescritura de policies
ALTER TABLE public.team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- companies
DROP POLICY IF EXISTS "companies_select_own_or_admin_or_verified" ON public.companies;
DROP POLICY IF EXISTS "companies_select_own_admin_or_team" ON public.companies;
CREATE POLICY "companies_select_own_admin_or_team"
ON public.companies FOR SELECT
USING (
  profile_id = auth.uid()
  OR public.is_admin()
  OR public.is_team_member(id)
);

DROP POLICY IF EXISTS "companies_insert_own" ON public.companies;
DROP POLICY IF EXISTS "companies_insert_superadmin_only" ON public.companies;
CREATE POLICY "companies_insert_superadmin_only"
ON public.companies FOR INSERT
WITH CHECK (public.is_superadmin());

-- installers
DROP POLICY IF EXISTS "installers_select_own_admin_or_approved" ON public.installers;
DROP POLICY IF EXISTS "installers_select_own_admin_or_team" ON public.installers;
CREATE POLICY "installers_select_own_admin_or_team"
ON public.installers FOR SELECT
USING (
  profile_id = auth.uid()
  OR public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.team_memberships tm
    WHERE tm.installer_id = installers.id
      AND tm.company_id = public.my_company_id()
      AND tm.status = 'active'
  )
);

-- installer_skills
DROP POLICY IF EXISTS "installer_skills_select_own_admin_or_approved" ON public.installer_skills;
DROP POLICY IF EXISTS "installer_skills_select_own_admin_or_team" ON public.installer_skills;
CREATE POLICY "installer_skills_select_own_admin_or_team"
ON public.installer_skills FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.installers
    WHERE id = installer_id AND (
      profile_id = auth.uid()
      OR public.is_admin()
      OR EXISTS (
        SELECT 1 FROM public.team_memberships tm
        WHERE tm.installer_id = installers.id
          AND tm.company_id = public.my_company_id()
          AND tm.status = 'active'
      )
    )
  )
);

-- team_memberships
DROP POLICY IF EXISTS "team_memberships_select_own_or_admin" ON public.team_memberships;
CREATE POLICY "team_memberships_select_own_or_admin"
ON public.team_memberships FOR SELECT
USING (
  company_id = public.my_company_id()
  OR installer_id = public.my_installer_id()
  OR public.is_admin()
);

DROP POLICY IF EXISTS "team_memberships_insert_company_or_admin" ON public.team_memberships;
CREATE POLICY "team_memberships_insert_company_or_admin"
ON public.team_memberships FOR INSERT
WITH CHECK (
  company_id = public.my_company_id()
  OR public.is_admin()
);

DROP POLICY IF EXISTS "team_memberships_update_company_or_admin" ON public.team_memberships;
CREATE POLICY "team_memberships_update_company_or_admin"
ON public.team_memberships FOR UPDATE
USING (company_id = public.my_company_id() OR public.is_admin())
WITH CHECK (company_id = public.my_company_id() OR public.is_admin());

-- invitations
DROP POLICY IF EXISTS "invitations_select_own_company_or_admin" ON public.invitations;
CREATE POLICY "invitations_select_own_company_or_admin"
ON public.invitations FOR SELECT
USING (
  company_id = public.my_company_id()
  OR public.is_admin()
);

DROP POLICY IF EXISTS "invitations_insert_own_company_or_admin" ON public.invitations;
CREATE POLICY "invitations_insert_own_company_or_admin"
ON public.invitations FOR INSERT
WITH CHECK (
  company_id = public.my_company_id()
  OR public.is_admin()
);

DROP POLICY IF EXISTS "invitations_update_own_company_or_admin" ON public.invitations;
CREATE POLICY "invitations_update_own_company_or_admin"
ON public.invitations FOR UPDATE
USING (company_id = public.my_company_id() OR public.is_admin())
WITH CHECK (company_id = public.my_company_id() OR public.is_admin());

-- jobs (recrea la policy SELECT dropeada en step 1)
CREATE POLICY "jobs_select_company_admin_assigned_or_team_open"
ON public.jobs FOR SELECT
USING (
  company_id = public.my_company_id()
  OR public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.agreements
    WHERE agreements.job_id = jobs.id AND agreements.installer_id = public.my_installer_id()
  )
  OR (status = 'published' AND public.is_team_member(company_id))
);

-- job_files (recrea la policy SELECT dropeada en step 1)
CREATE POLICY "job_files_select_company_admin_assigned_or_team_open"
ON public.job_files FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.jobs
    WHERE id = job_id AND (
      company_id = public.my_company_id()
      OR public.is_admin()
      OR EXISTS (
        SELECT 1 FROM public.agreements
        WHERE agreements.job_id = jobs.id AND agreements.installer_id = public.my_installer_id()
      )
      OR (jobs.status = 'published' AND public.is_team_member(jobs.company_id))
    )
  )
);

-- agreements
DROP POLICY IF EXISTS "agreements_insert_admin_only" ON public.agreements;
DROP POLICY IF EXISTS "agreements_insert_company_or_claiming_installer" ON public.agreements;
CREATE POLICY "agreements_insert_company_or_claiming_installer"
ON public.agreements FOR INSERT
WITH CHECK (
  company_id = public.my_company_id()
  OR (installer_id = public.my_installer_id() AND public.is_team_member(company_id))
  OR public.is_admin()
);

-- reviews
DROP POLICY IF EXISTS "reviews_select_all" ON public.reviews;
DROP POLICY IF EXISTS "reviews_select_parties_admin_or_team" ON public.reviews;
CREATE POLICY "reviews_select_parties_admin_or_team"
ON public.reviews FOR SELECT
USING (
  reviewer_id = auth.uid()
  OR reviewed_id = auth.uid()
  OR public.is_admin()
  OR public.is_team_member((SELECT company_id FROM public.agreements WHERE id = reviews.agreement_id))
);

-- ============================================================
-- VERIFICACIÓN (correr después, debería devolver filas)
-- ============================================================
-- SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public' AND table_name IN ('team_memberships', 'invitations');
-- SELECT enumlabel FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
--   WHERE t.typname = 'job_status' ORDER BY enumsortorder;
