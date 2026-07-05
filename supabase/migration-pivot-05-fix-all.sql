-- ============================================================
-- PIVOT B2B SAAS - 05: FIX / CONSOLIDATED (covers 02 + 03 + 04)
-- Run this ONCE after migration-pivot-01. Idempotent: safe to
-- re-run if it fails partway.
-- Why: migration 02 failed because Postgres cannot ALTER a column's
-- type while RLS policies reference it, so policies are dropped first.
-- ============================================================

-- ------------------------------------------------------------
-- STEP 1: drop ALL policies that reference jobs.status or the
-- offers table (old and new names, in case of partial runs)
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "jobs_select_company_admin_or_published" ON public.jobs;
DROP POLICY IF EXISTS "jobs_select_company_admin_assigned_or_team_open" ON public.jobs;
DROP POLICY IF EXISTS "job_files_select_company_admin_or_published" ON public.job_files;
DROP POLICY IF EXISTS "job_files_select_company_admin_assigned_or_team_open" ON public.job_files;

-- ------------------------------------------------------------
-- STEP 2: drop offers table + enum (also removes its policies)
-- ------------------------------------------------------------

DROP TABLE IF EXISTS public.offers CASCADE;
DROP TYPE IF EXISTS public.offer_status;

-- ------------------------------------------------------------
-- STEP 3: job_status enum swap (skip if already done)
-- ------------------------------------------------------------

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

-- ------------------------------------------------------------
-- STEP 4: jobs / agreements / companies column changes
-- ------------------------------------------------------------

ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS claimed_by_installer_id UUID REFERENCES public.installers(id);
CREATE INDEX IF NOT EXISTS idx_jobs_claimed_by_installer_id ON public.jobs(claimed_by_installer_id);
ALTER TABLE public.jobs DROP COLUMN IF EXISTS offers_count;

COMMENT ON COLUMN public.jobs.budget_min IS 'Optional internal cost note (not a payment feature).';
COMMENT ON COLUMN public.jobs.budget_max IS 'Optional internal cost note (not a payment feature).';

ALTER TABLE public.agreements DROP COLUMN IF EXISTS offer_id;
COMMENT ON COLUMN public.agreements.final_price IS 'Optional internal cost note (not a payment feature).';

ALTER TABLE public.companies ALTER COLUMN status SET DEFAULT 'verified';

-- ------------------------------------------------------------
-- STEP 5: helper functions (CREATE OR REPLACE = idempotent)
-- ------------------------------------------------------------

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

-- ------------------------------------------------------------
-- STEP 6: RLS on new tables + full policy rewrite
-- ------------------------------------------------------------

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

-- jobs (recreate the SELECT policy dropped in step 1)
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

-- job_files (recreate the SELECT policy dropped in step 1)
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
