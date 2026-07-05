-- ============================================================
-- SE INSTALA PRO - DATABASE SCHEMA
-- MVP - Marketplace de Instalaciones Gráficas
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE public.user_role AS ENUM ('company', 'installer', 'admin', 'superadmin');
CREATE TYPE public.profile_status AS ENUM ('active', 'pending', 'suspended', 'deleted');
CREATE TYPE public.company_status AS ENUM ('pending_review', 'verified', 'rejected', 'suspended');
CREATE TYPE public.installer_status AS ENUM ('draft', 'pending_review', 'approved', 'changes_requested', 'rejected', 'suspended');
CREATE TYPE public.job_status AS ENUM (
  'draft', 'pending_admin_approval', 'published', 'assigned',
  'coordinating', 'confirmed', 'in_progress',
  'completed_by_installer', 'under_company_review', 'approved', 'rated', 'cancelled', 'disputed'
);
CREATE TYPE public.agreement_status AS ENUM ('active', 'coordinating', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed');
CREATE TYPE public.dispute_status AS ENUM ('new', 'under_review', 'waiting_company', 'waiting_installer', 'resolved', 'closed');
CREATE TYPE public.file_type AS ENUM ('image', 'document', 'other');
CREATE TYPE public.team_membership_status AS ENUM ('active', 'removed');
CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'expired', 'revoked');

-- ============================================================
-- PROFILES TABLE (linked to auth.users)
-- ============================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country_code TEXT,
  status public.profile_status NOT NULL DEFAULT 'pending',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- COMPANIES TABLE
-- ============================================================

CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  tax_id TEXT,
  website TEXT,
  logo_url TEXT,
  description TEXT,
  status public.company_status NOT NULL DEFAULT 'verified',
  country TEXT NOT NULL DEFAULT 'AR',
  city TEXT,
  address TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_by_superadmin_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(profile_id)
);

-- ============================================================
-- LOCATIONS TABLE
-- ============================================================

CREATE TABLE public.locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country_code TEXT NOT NULL,
  country_name TEXT NOT NULL,
  province_code TEXT,
  province_name TEXT,
  city_name TEXT NOT NULL,
  zone_name TEXT,
  coordinates POINT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(country_code, province_code, city_name, zone_name)
);

-- ============================================================
-- CATEGORIES TABLE (Categorías gráficas)
-- ============================================================

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(name)
);

-- ============================================================
-- INSTALLERS TABLE
-- ============================================================

CREATE TABLE public.installers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.installer_status NOT NULL DEFAULT 'draft',
  years_of_experience INTEGER,
  bio TEXT,
  portfolio_url TEXT,
  avg_rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  verification_document_url TEXT,
  country TEXT NOT NULL DEFAULT 'AR',
  coverage_zones TEXT[], -- Array of zones they work in
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(profile_id)
);

-- ============================================================
-- INSTALLER SKILLS TABLE
-- ============================================================

CREATE TABLE public.installer_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  installer_id UUID NOT NULL REFERENCES public.installers(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  proficiency_level TEXT, -- 'junior', 'mid', 'senior'
  years_of_experience INTEGER,
  verified_by_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(installer_id, skill_name)
);

-- ============================================================
-- JOBS TABLE
-- ============================================================

CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  title TEXT NOT NULL,
  description TEXT,
  location_id UUID REFERENCES public.locations(id),
  status public.job_status NOT NULL DEFAULT 'draft',
  budget_min NUMERIC(10,2), -- optional internal cost note, not a payment feature
  budget_max NUMERIC(10,2), -- optional internal cost note, not a payment feature
  currency TEXT DEFAULT 'ARS',
  start_date DATE,
  end_date DATE,
  files_count INTEGER DEFAULT 0,
  claimed_by_installer_id UUID REFERENCES public.installers(id),
  admin_approved_at TIMESTAMP WITH TIME ZONE,
  admin_rejection_reason TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- JOB FILES (Images, documents)
-- ============================================================

CREATE TABLE public.job_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  file_type public.file_type NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  storage_path TEXT,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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

-- ============================================================
-- AGREEMENTS TABLE (created when a company assigns, or an installer
-- claims, a job -- there is no bidding/offer step anymore)
-- ============================================================

CREATE TABLE public.agreements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  installer_id UUID NOT NULL REFERENCES public.installers(id),
  status public.agreement_status NOT NULL DEFAULT 'active',
  final_price NUMERIC(10,2), -- optional internal cost note, not a payment feature
  currency TEXT DEFAULT 'ARS',
  confirmed_start_date DATE,
  confirmed_end_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- MESSAGES TABLE
-- ============================================================

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  agreement_id UUID REFERENCES public.agreements(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id),
  message_text TEXT NOT NULL,
  file_url TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CHECK (job_id IS NOT NULL OR agreement_id IS NOT NULL)
);

-- ============================================================
-- REVIEWS TABLE
-- ============================================================

CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  agreement_id UUID NOT NULL REFERENCES public.agreements(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id),
  reviewed_id UUID NOT NULL REFERENCES public.profiles(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  categories JSONB, -- {punctuality, quality, communication, professionalism}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(job_id, reviewer_id)
);

-- ============================================================
-- DISPUTES TABLE
-- ============================================================

CREATE TABLE public.disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  agreement_id UUID REFERENCES public.agreements(id),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id),
  status public.dispute_status NOT NULL DEFAULT 'new',
  title TEXT NOT NULL,
  description TEXT,
  evidence_urls TEXT[],
  admin_notes TEXT,
  resolution TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'job_published', 'offer_received', 'offer_accepted', etc
  title TEXT NOT NULL,
  message TEXT,
  related_entity_type TEXT, -- 'job', 'offer', 'agreement', 'review'
  related_entity_id UUID,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- AUDIT LOGS TABLE
-- ============================================================

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id),
  action_type TEXT NOT NULL, -- 'approve_job', 'reject_installer', 'resolve_dispute'
  affected_entity_type TEXT NOT NULL,
  affected_entity_id UUID NOT NULL,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_companies_profile_id ON public.companies(profile_id);
CREATE INDEX idx_companies_status ON public.companies(status);
CREATE INDEX idx_installers_profile_id ON public.installers(profile_id);
CREATE INDEX idx_installers_status ON public.installers(status);
CREATE INDEX idx_installer_skills_installer_id ON public.installer_skills(installer_id);
CREATE INDEX idx_jobs_company_id ON public.jobs(company_id);
CREATE INDEX idx_jobs_category_id ON public.jobs(category_id);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_job_files_job_id ON public.job_files(job_id);
CREATE INDEX idx_jobs_claimed_by_installer_id ON public.jobs(claimed_by_installer_id);
CREATE INDEX idx_team_memberships_company_id ON public.team_memberships(company_id);
CREATE INDEX idx_team_memberships_installer_id ON public.team_memberships(installer_id);
CREATE INDEX idx_team_memberships_status ON public.team_memberships(status);
CREATE INDEX idx_invitations_company_id ON public.invitations(company_id);
CREATE INDEX idx_invitations_token ON public.invitations(token);
CREATE INDEX idx_invitations_email ON public.invitations(email);
CREATE INDEX idx_invitations_status ON public.invitations(status);
CREATE INDEX idx_agreements_company_id ON public.agreements(company_id);
CREATE INDEX idx_agreements_installer_id ON public.agreements(installer_id);
CREATE INDEX idx_agreements_status ON public.agreements(status);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX idx_messages_job_id ON public.messages(job_id);
CREATE INDEX idx_reviews_reviewer_id ON public.reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewed_id ON public.reviews(reviewed_id);
CREATE INDEX idx_disputes_reporter_id ON public.disputes(reporter_id);
CREATE INDEX idx_disputes_status ON public.disputes(status);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_audit_logs_admin_id ON public.audit_logs(admin_id);
CREATE INDEX idx_audit_logs_action_type ON public.audit_logs(action_type);

-- ============================================================
-- TIMESTAMPS
-- ============================================================

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION moddatetime (updated_at);

CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION moddatetime (updated_at);

CREATE TRIGGER update_installers_updated_at
BEFORE UPDATE ON public.installers
FOR EACH ROW
EXECUTE FUNCTION moddatetime (updated_at);

CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION moddatetime (updated_at);

CREATE TRIGGER update_team_memberships_updated_at
BEFORE UPDATE ON public.team_memberships
FOR EACH ROW
EXECUTE FUNCTION moddatetime (updated_at);

CREATE TRIGGER update_agreements_updated_at
BEFORE UPDATE ON public.agreements
FOR EACH ROW
EXECUTE FUNCTION moddatetime (updated_at);

CREATE TRIGGER update_disputes_updated_at
BEFORE UPDATE ON public.disputes
FOR EACH ROW
EXECUTE FUNCTION moddatetime (updated_at);
