-- ============================================================
-- SE INSTALA PRO - ROW LEVEL SECURITY POLICIES
-- MVP - Marketplace de Instalaciones Gráficas
-- ============================================================

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS UUID
LANGUAGE SQL STABLE AS $$
  SELECT auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role
LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin') AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'superadmin' AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.my_company_id()
RETURNS UUID
LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT id FROM public.companies WHERE profile_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.my_installer_id()
RETURNS UUID
LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT id FROM public.installers WHERE profile_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.my_installer_is_approved()
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.installers
    WHERE profile_id = auth.uid() AND status = 'approved'
  );
$$;

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installer_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES POLICIES
-- ============================================================

CREATE POLICY "profiles_select_own_or_admin"
ON public.profiles FOR SELECT
USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "profiles_update_own_or_admin"
ON public.profiles FOR UPDATE
USING (id = auth.uid() OR public.is_admin())
WITH CHECK (id = auth.uid() OR public.is_admin());

CREATE POLICY "profiles_insert_authenticated"
ON public.profiles FOR INSERT
WITH CHECK (id = auth.uid());

-- ============================================================
-- COMPANIES POLICIES
-- ============================================================

CREATE POLICY "companies_select_own_or_admin_or_verified"
ON public.companies FOR SELECT
USING (
  profile_id = auth.uid()
  OR public.is_admin()
  OR status = 'verified'
);

CREATE POLICY "companies_insert_own"
ON public.companies FOR INSERT
WITH CHECK (profile_id = auth.uid());

CREATE POLICY "companies_update_own_or_admin"
ON public.companies FOR UPDATE
USING (profile_id = auth.uid() OR public.is_admin())
WITH CHECK (profile_id = auth.uid() OR public.is_admin());

CREATE POLICY "companies_delete_admin_only"
ON public.companies FOR DELETE
USING (public.is_admin());

-- ============================================================
-- LOCATIONS POLICIES
-- ============================================================

CREATE POLICY "locations_select_all"
ON public.locations FOR SELECT
USING (is_active = true);

CREATE POLICY "locations_admin_all"
ON public.locations FOR ALL
USING (public.is_admin());

-- ============================================================
-- CATEGORIES POLICIES
-- ============================================================

CREATE POLICY "categories_select_all"
ON public.categories FOR SELECT
USING (is_active = true);

CREATE POLICY "categories_admin_all"
ON public.categories FOR ALL
USING (public.is_admin());

-- ============================================================
-- INSTALLERS POLICIES
-- ============================================================

CREATE POLICY "installers_select_own_admin_or_approved"
ON public.installers FOR SELECT
USING (
  profile_id = auth.uid()
  OR public.is_admin()
  OR status = 'approved'
);

CREATE POLICY "installers_insert_own"
ON public.installers FOR INSERT
WITH CHECK (profile_id = auth.uid());

CREATE POLICY "installers_update_own_or_admin"
ON public.installers FOR UPDATE
USING (profile_id = auth.uid() OR public.is_admin())
WITH CHECK (profile_id = auth.uid() OR public.is_admin());

CREATE POLICY "installers_delete_admin_only"
ON public.installers FOR DELETE
USING (public.is_admin());

-- ============================================================
-- INSTALLER SKILLS POLICIES
-- ============================================================

CREATE POLICY "installer_skills_select_own_admin_or_approved"
ON public.installer_skills FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.installers
    WHERE id = installer_id AND (
      profile_id = auth.uid()
      OR public.is_admin()
      OR status = 'approved'
    )
  )
);

CREATE POLICY "installer_skills_insert_own"
ON public.installer_skills FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.installers
    WHERE id = installer_id AND profile_id = auth.uid()
  )
);

CREATE POLICY "installer_skills_update_own"
ON public.installer_skills FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.installers
    WHERE id = installer_id AND profile_id = auth.uid()
  )
);

CREATE POLICY "installer_skills_delete_own"
ON public.installer_skills FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.installers
    WHERE id = installer_id AND profile_id = auth.uid()
  )
);

-- ============================================================
-- JOBS POLICIES
-- ============================================================

CREATE POLICY "jobs_select_company_admin_or_published"
ON public.jobs FOR SELECT
USING (
  company_id = public.my_company_id()
  OR public.is_admin()
  OR (status = 'published' AND EXISTS (
    SELECT 1 FROM public.installers
    WHERE profile_id = auth.uid() AND status = 'approved'
  ))
);

CREATE POLICY "jobs_insert_company"
ON public.jobs FOR INSERT
WITH CHECK (company_id = public.my_company_id());

CREATE POLICY "jobs_update_company_or_admin"
ON public.jobs FOR UPDATE
USING (
  company_id = public.my_company_id()
  OR public.is_admin()
)
WITH CHECK (
  company_id = public.my_company_id()
  OR public.is_admin()
);

CREATE POLICY "jobs_delete_company_or_admin"
ON public.jobs FOR DELETE
USING (company_id = public.my_company_id() OR public.is_admin());

-- ============================================================
-- JOB FILES POLICIES
-- ============================================================

CREATE POLICY "job_files_select_company_admin_or_published"
ON public.job_files FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.jobs
    WHERE id = job_id AND (
      company_id = public.my_company_id()
      OR public.is_admin()
      OR status = 'published'
    )
  )
);

CREATE POLICY "job_files_insert_company_or_admin"
ON public.job_files FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.jobs
    WHERE id = job_id AND (
      company_id = public.my_company_id()
      OR public.is_admin()
    )
  )
);

CREATE POLICY "job_files_delete_company_or_admin"
ON public.job_files FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.jobs
    WHERE id = job_id AND (
      company_id = public.my_company_id()
      OR public.is_admin()
    )
  )
);

-- ============================================================
-- OFFERS POLICIES
-- ============================================================

CREATE POLICY "offers_select_own_company_admin"
ON public.offers FOR SELECT
USING (
  installer_id = public.my_installer_id()
  OR EXISTS (
    SELECT 1 FROM public.jobs
    WHERE id = job_id AND company_id = public.my_company_id()
  )
  OR public.is_admin()
);

CREATE POLICY "offers_insert_approved_installer"
ON public.offers FOR INSERT
WITH CHECK (
  installer_id = public.my_installer_id()
  AND public.my_installer_is_approved()
  AND EXISTS (
    SELECT 1 FROM public.jobs
    WHERE id = job_id AND status IN ('published', 'receiving_offers')
  )
);

CREATE POLICY "offers_update_own_or_admin"
ON public.offers FOR UPDATE
USING (
  installer_id = public.my_installer_id()
  OR public.is_admin()
)
WITH CHECK (
  installer_id = public.my_installer_id()
  OR public.is_admin()
);

-- ============================================================
-- AGREEMENTS POLICIES
-- ============================================================

CREATE POLICY "agreements_select_own_or_admin"
ON public.agreements FOR SELECT
USING (
  company_id = public.my_company_id()
  OR installer_id = public.my_installer_id()
  OR public.is_admin()
);

CREATE POLICY "agreements_insert_admin_only"
ON public.agreements FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "agreements_update_own_or_admin"
ON public.agreements FOR UPDATE
USING (
  company_id = public.my_company_id()
  OR installer_id = public.my_installer_id()
  OR public.is_admin()
)
WITH CHECK (
  company_id = public.my_company_id()
  OR installer_id = public.my_installer_id()
  OR public.is_admin()
);

-- ============================================================
-- MESSAGES POLICIES
-- ============================================================

CREATE POLICY "messages_select_own_or_admin"
ON public.messages FOR SELECT
USING (
  sender_id = auth.uid()
  OR recipient_id = auth.uid()
  OR public.is_admin()
);

CREATE POLICY "messages_insert_authenticated"
ON public.messages FOR INSERT
WITH CHECK (sender_id = auth.uid());

-- ============================================================
-- REVIEWS POLICIES
-- ============================================================

CREATE POLICY "reviews_select_all"
ON public.reviews FOR SELECT
USING (true);

CREATE POLICY "reviews_insert_own"
ON public.reviews FOR INSERT
WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "reviews_update_own_or_admin"
ON public.reviews FOR UPDATE
USING (reviewer_id = auth.uid() OR public.is_admin());

-- ============================================================
-- DISPUTES POLICIES
-- ============================================================

CREATE POLICY "disputes_select_own_or_admin"
ON public.disputes FOR SELECT
USING (
  reporter_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.agreements
    WHERE id = agreement_id AND (
      company_id = public.my_company_id()
      OR installer_id = public.my_installer_id()
    )
  )
  OR public.is_admin()
);

CREATE POLICY "disputes_insert_own"
ON public.disputes FOR INSERT
WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "disputes_update_own_or_admin"
ON public.disputes FOR UPDATE
USING (reporter_id = auth.uid() OR public.is_admin());

-- ============================================================
-- NOTIFICATIONS POLICIES
-- ============================================================

CREATE POLICY "notifications_select_own"
ON public.notifications FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "notifications_insert_authenticated"
ON public.notifications FOR INSERT
WITH CHECK (true); -- System generated

CREATE POLICY "notifications_update_own"
ON public.notifications FOR UPDATE
USING (user_id = auth.uid());

-- ============================================================
-- AUDIT LOGS POLICIES
-- ============================================================

CREATE POLICY "audit_logs_select_admin_only"
ON public.audit_logs FOR SELECT
USING (public.is_admin());

CREATE POLICY "audit_logs_insert_admin_only"
ON public.audit_logs FOR INSERT
WITH CHECK (public.is_admin());
