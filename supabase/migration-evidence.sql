-- ============================================================
-- EVIDENCIA FOTOGRÁFICA DE ENTREGA
-- Pegar en el SQL Editor de Supabase y ejecutar UNA vez.
-- Idempotente: safe de re-correr.
-- ============================================================

-- Las fotos de evidencia se guardan en job_files con file_type
-- 'evidence' (bucket privado 'evidence' en Storage).
ALTER TYPE public.file_type ADD VALUE IF NOT EXISTS 'evidence';

-- Quién subió el archivo (para distinguir evidencia del instalador
-- de archivos de la empresa) y a qué acuerdo pertenece.
ALTER TABLE public.job_files ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.job_files ADD COLUMN IF NOT EXISTS agreement_id UUID REFERENCES public.agreements(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_job_files_agreement_id ON public.job_files(agreement_id);

-- ============================================================
-- VERIFICACIÓN (opcional)
-- ============================================================
-- SELECT enumlabel FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
--   WHERE t.typname = 'file_type' ORDER BY enumsortorder;
