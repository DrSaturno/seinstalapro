-- ============================================================
-- PIVOT B2B SAAS - 02: JOBS / AGREEMENTS RESTRUCTURING
-- ============================================================

-- ------------------------------------------------------------
-- job_status: rebuild enum (drop 'receiving_offers'/'offer_accepted',
-- add 'assigned'). Postgres can't DROP VALUE, so swap the type.
-- ------------------------------------------------------------

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

-- ------------------------------------------------------------
-- jobs: track direct claim-by-installer (open-to-team jobs)
-- ------------------------------------------------------------

ALTER TABLE public.jobs ADD COLUMN claimed_by_installer_id UUID REFERENCES public.installers(id);
CREATE INDEX idx_jobs_claimed_by_installer_id ON public.jobs(claimed_by_installer_id);

-- offers_count was a bidding-count denormalization, no longer meaningful
ALTER TABLE public.jobs DROP COLUMN offers_count;

-- budget_min/max kept, but repurposed as an optional internal note (no payment flow)
COMMENT ON COLUMN public.jobs.budget_min IS 'Optional internal cost note (not a payment feature).';
COMMENT ON COLUMN public.jobs.budget_max IS 'Optional internal cost note (not a payment feature).';

-- ------------------------------------------------------------
-- agreements: no longer created from an accepted offer
-- ------------------------------------------------------------

ALTER TABLE public.agreements DROP COLUMN offer_id;

COMMENT ON COLUMN public.agreements.final_price IS 'Optional internal cost note (not a payment feature).';

-- ------------------------------------------------------------
-- companies: superadmin creates companies pre-verified (no self-serve
-- moderation queue anymore)
-- ------------------------------------------------------------

ALTER TABLE public.companies ALTER COLUMN status SET DEFAULT 'verified';
