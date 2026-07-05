-- ============================================================
-- PIVOT B2B SAAS - 04: RLS REDESIGN (team-scoped, not public)
-- ============================================================

-- ------------------------------------------------------------
-- NEW HELPER FUNCTIONS
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
-- ENABLE RLS ON NEW TABLES
-- ------------------------------------------------------------

ALTER TABLE public.team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- COMPANIES: drop public "verified" visibility, gate creation to superadmin
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "companies_select_own_or_admin_or_verified" ON public.companies;
CREATE POLICY "companies_select_own_admin_or_team"
ON public.companies FOR SELECT
USING (
  profile_id = auth.uid()
  OR public.is_admin()
  OR public.is_team_member(id)
);

DROP POLICY IF EXISTS "companies_insert_own" ON public.companies;
CREATE POLICY "companies_insert_superadmin_only"
ON public.companies FOR INSERT
WITH CHECK (public.is_superadmin());

-- ------------------------------------------------------------
-- INSTALLERS: drop public "approved" visibility, scope to team
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "installers_select_own_admin_or_approved" ON public.installers;
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

-- ------------------------------------------------------------
-- INSTALLER SKILLS: same team-scoping as installers
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "installer_skills_select_own_admin_or_approved" ON public.installer_skills;
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

-- ------------------------------------------------------------
-- TEAM MEMBERSHIPS
-- ------------------------------------------------------------

CREATE POLICY "team_memberships_select_own_or_admin"
ON public.team_memberships FOR SELECT
USING (
  company_id = public.my_company_id()
  OR installer_id = public.my_installer_id()
  OR public.is_admin()
);

CREATE POLICY "team_memberships_insert_company_or_admin"
ON public.team_memberships FOR INSERT
WITH CHECK (
  company_id = public.my_company_id()
  OR public.is_admin()
);

CREATE POLICY "team_memberships_update_company_or_admin"
ON public.team_memberships FOR UPDATE
USING (company_id = public.my_company_id() OR public.is_admin())
WITH CHECK (company_id = public.my_company_id() OR public.is_admin());

-- ------------------------------------------------------------
-- INVITATIONS
-- ------------------------------------------------------------

CREATE POLICY "invitations_select_own_company_or_admin"
ON public.invitations FOR SELECT
USING (
  company_id = public.my_company_id()
  OR public.is_admin()
);

CREATE POLICY "invitations_insert_own_company_or_admin"
ON public.invitations FOR INSERT
WITH CHECK (
  company_id = public.my_company_id()
  OR public.is_admin()
);

CREATE POLICY "invitations_update_own_company_or_admin"
ON public.invitations FOR UPDATE
USING (company_id = public.my_company_id() OR public.is_admin())
WITH CHECK (company_id = public.my_company_id() OR public.is_admin());

-- ------------------------------------------------------------
-- JOBS: visible to owning company, assigned installer, or team (if published)
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "jobs_select_company_admin_or_published" ON public.jobs;
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

-- ------------------------------------------------------------
-- JOB FILES: mirror jobs visibility
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "job_files_select_company_admin_or_published" ON public.job_files;
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

-- ------------------------------------------------------------
-- AGREEMENTS: created directly by company assignment or installer claim
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "agreements_insert_admin_only" ON public.agreements;
CREATE POLICY "agreements_insert_company_or_claiming_installer"
ON public.agreements FOR INSERT
WITH CHECK (
  company_id = public.my_company_id()
  OR (installer_id = public.my_installer_id() AND public.is_team_member(company_id))
  OR public.is_admin()
);

-- ------------------------------------------------------------
-- REVIEWS: internal to the team, not public
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "reviews_select_all" ON public.reviews;
CREATE POLICY "reviews_select_parties_admin_or_team"
ON public.reviews FOR SELECT
USING (
  reviewer_id = auth.uid()
  OR reviewed_id = auth.uid()
  OR public.is_admin()
  OR public.is_team_member((SELECT company_id FROM public.agreements WHERE id = reviews.agreement_id))
);
