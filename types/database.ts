// ============================================================
// DATABASE TYPES - Generated from Supabase schema
// ============================================================

export type UserRole = 'company' | 'installer' | 'admin' | 'superadmin'
export type ProfileStatus = 'active' | 'pending' | 'suspended' | 'deleted'
export type CompanyStatus = 'pending_review' | 'verified' | 'rejected' | 'suspended'
export type InstallerStatus = 'draft' | 'pending_review' | 'approved' | 'changes_requested' | 'rejected' | 'suspended'
export type JobStatus =
  | 'draft'
  | 'pending_admin_approval'
  | 'published'
  | 'receiving_offers'
  | 'offer_accepted'
  | 'coordinating'
  | 'confirmed'
  | 'in_progress'
  | 'completed_by_installer'
  | 'under_company_review'
  | 'approved'
  | 'rated'
  | 'cancelled'
  | 'disputed'
export type OfferStatus = 'sent' | 'withdrawn' | 'shortlisted' | 'accepted' | 'rejected' | 'expired'
export type AgreementStatus = 'active' | 'coordinating' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
export type DisputeStatus = 'new' | 'under_review' | 'waiting_company' | 'waiting_installer' | 'resolved' | 'closed'
export type FileType = 'image' | 'document' | 'other'

// ============================================================
// TABLES
// ============================================================

export interface Profile {
  id: string
  role: UserRole
  full_name: string
  email: string
  phone?: string
  country_code?: string
  status: ProfileStatus
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  profile_id: string
  company_name: string
  tax_id?: string
  website?: string
  logo_url?: string
  description?: string
  status: CompanyStatus
  country: string
  city?: string
  address?: string
  verified_at?: string
  created_at: string
  updated_at: string
}

export interface Location {
  id: string
  country_code: string
  country_name: string
  province_code?: string
  province_name?: string
  city_name: string
  zone_name?: string
  coordinates?: string
  is_active: boolean
  created_at: string
}

export interface Category {
  id: string
  name: string
  description?: string
  icon_url?: string
  order_index: number
  is_active: boolean
  created_at: string
}

export interface Installer {
  id: string
  profile_id: string
  status: InstallerStatus
  years_of_experience?: number
  bio?: string
  portfolio_url?: string
  avg_rating: number
  total_reviews: number
  is_verified: boolean
  verification_document_url?: string
  country: string
  coverage_zones?: string[]
  approved_at?: string
  rejected_reason?: string
  created_at: string
  updated_at: string
}

export interface InstallerSkill {
  id: string
  installer_id: string
  skill_name: string
  proficiency_level?: string
  years_of_experience?: number
  verified_by_admin: boolean
  created_at: string
}

export interface Job {
  id: string
  company_id: string
  category_id: string
  title: string
  description?: string
  location_id?: string
  status: JobStatus
  budget_min?: number
  budget_max?: number
  currency: string
  start_date?: string
  end_date?: string
  files_count: number
  offers_count: number
  admin_approved_at?: string
  admin_rejection_reason?: string
  published_at?: string
  created_at: string
  updated_at: string
}

export interface JobFile {
  id: string
  job_id: string
  file_type: FileType
  file_url: string
  file_name?: string
  file_size?: number
  storage_path?: string
  order_index?: number
  created_at: string
}

export interface Offer {
  id: string
  job_id: string
  installer_id: string
  status: OfferStatus
  proposed_price: number
  currency: string
  availability_start_date?: string
  availability_end_date?: string
  estimated_duration?: string
  estimated_duration_value?: number
  team_size: number
  message?: string
  submitted_at: string
  reviewed_at?: string
  accepted_at?: string
  rejected_at?: string
  created_at: string
  updated_at: string
}

export interface Agreement {
  id: string
  job_id: string
  offer_id: string
  company_id: string
  installer_id: string
  status: AgreementStatus
  final_price?: number
  currency: string
  confirmed_start_date?: string
  confirmed_end_date?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  job_id?: string
  agreement_id?: string
  sender_id: string
  recipient_id: string
  message_text: string
  file_url?: string
  is_read: boolean
  read_at?: string
  created_at: string
}

export interface Review {
  id: string
  job_id: string
  agreement_id: string
  reviewer_id: string
  reviewed_id: string
  rating: number
  comment?: string
  categories?: Record<string, number>
  created_at: string
}

export interface Dispute {
  id: string
  job_id: string
  agreement_id?: string
  reporter_id: string
  status: DisputeStatus
  title: string
  description?: string
  evidence_urls?: string[]
  admin_notes?: string
  resolution?: string
  resolved_at?: string
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  notification_type: string
  title: string
  message?: string
  related_entity_type?: string
  related_entity_id?: string
  is_read: boolean
  read_at?: string
  created_at: string
}

export interface AuditLog {
  id: string
  admin_id: string
  action_type: string
  affected_entity_type: string
  affected_entity_id: string
  details?: Record<string, any>
  ip_address?: string
  created_at: string
}

// ============================================================
// COMBINED TYPES (for UI components)
// ============================================================

export interface JobWithCompany extends Job {
  company?: Company
  category?: Category
  location?: Location
  files?: JobFile[]
}

export interface OfferWithInstaller extends Offer {
  installer?: Installer
  job?: Job
}

export interface AgreementWithDetails extends Agreement {
  job?: Job
  company?: Company
  installer?: Installer
  offer?: Offer
}
