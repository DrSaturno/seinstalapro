-- ============================================================
-- SE INSTALA PRO - STORAGE BUCKETS CONFIGURATION
-- ============================================================

-- Note: Buckets must be created via Supabase dashboard or API
-- This is a reference for bucket configuration

-- BUCKET 1: job_images
-- Purpose: Job images and documents
-- Public: Yes (once job is published)
-- Max file size: 10MB per file

-- BUCKET 2: installer_portfolios
-- Purpose: Installer portfolio images
-- Public: Yes (if installer is approved)
-- Max file size: 5MB per file

-- BUCKET 3: evidence
-- Purpose: Final evidence/completion photos
-- Public: No (private, only for parties involved)
-- Max file size: 10MB per file

-- BUCKET 4: dispute_evidence
-- Purpose: Dispute supporting documents
-- Public: No (private, admin only)
-- Max file size: 5MB per file

-- BUCKET 5: verification_documents
-- Purpose: Installer verification documents
-- Public: No (private, admin only)
-- Max file size: 10MB per file

-- ============================================================
-- STORAGE POLICIES (to be applied after bucket creation)
-- ============================================================

-- job_images policies
CREATE POLICY "job_images_select_public_or_own"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'job_images'
  AND (
    -- Public if job is published
    EXISTS (
      SELECT 1 FROM public.job_files jf
      JOIN public.jobs j ON j.id = jf.job_id
      WHERE jf.storage_path = name
      AND j.status = 'published'
    )
    -- Or owner/admin can see own
    OR auth.uid()::text IN (
      SELECT profile_id::text FROM public.companies
      WHERE id IN (
        SELECT company_id FROM public.jobs j
        WHERE EXISTS (
          SELECT 1 FROM public.job_files jf
          WHERE jf.job_id = j.id AND jf.storage_path = name
        )
      )
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  )
);

CREATE POLICY "job_images_insert_company"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'job_images'
  AND auth.uid()::text IN (
    SELECT profile_id::text FROM public.companies
  )
);

-- installer_portfolios policies
CREATE POLICY "installer_portfolios_select_public_or_own"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'installer_portfolios'
  AND (
    -- Public if installer is approved
    EXISTS (
      SELECT 1 FROM public.installers
      WHERE profile_id = auth.uid() OR status = 'approved'
    )
    -- Admin can see all
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  )
);

CREATE POLICY "installer_portfolios_insert_installer"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'installer_portfolios'
  AND auth.uid()::text IN (
    SELECT profile_id::text FROM public.installers
  )
);

-- evidence policies (private)
CREATE POLICY "evidence_select_own_or_admin"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'evidence'
  AND (
    -- Parties in agreement
    EXISTS (
      SELECT 1 FROM public.agreements a
      JOIN public.job_files jf ON jf.job_id = a.job_id
      WHERE jf.storage_path = name
      AND (a.company_id = (SELECT id FROM public.companies WHERE profile_id = auth.uid())
           OR a.installer_id = (SELECT id FROM public.installers WHERE profile_id = auth.uid()))
    )
    -- Admin
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  )
);

CREATE POLICY "evidence_insert_own"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'evidence'
  AND (
    auth.uid()::text IN (SELECT profile_id::text FROM public.installers)
    OR auth.uid()::text IN (SELECT profile_id::text FROM public.companies)
  )
);

-- dispute_evidence policies (admin only)
CREATE POLICY "dispute_evidence_select_admin"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'dispute_evidence'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "dispute_evidence_insert_owner_or_admin"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'dispute_evidence'
  AND (
    auth.uid()::text IN (SELECT profile_id::text FROM public.installers)
    OR auth.uid()::text IN (SELECT profile_id::text FROM public.companies)
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  )
);

-- verification_documents policies (admin only)
CREATE POLICY "verification_documents_select_admin"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification_documents'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "verification_documents_insert_installer_or_admin"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'verification_documents'
  AND (
    auth.uid()::text IN (SELECT profile_id::text FROM public.installers)
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  )
);
