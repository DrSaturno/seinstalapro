-- ============================================================
-- MIGRATION: Campos de especificación detallada de trabajos
--
-- ⚠️  PENDIENTE DE APLICAR — la app funciona sin esto pero los
--    campos nuevos del formulario (altura, herramientas, horarios,
--    superficie, dirección, urgencia) NO se guardan hasta aplicarla.
--
-- CÓMO APLICAR:
-- 1. Entrá a https://supabase.com/dashboard con la cuenta dueña
--    del proyecto jibvorqudveqgankoeak (no es la cuenta SeInstalaShop)
-- 2. Abrí el proyecto → SQL Editor → New query
-- 3. Pegá todo este archivo y ejecutá (Run)
--
-- Es 100% segura de re-ejecutar (IF NOT EXISTS) y no borra nada.
-- ============================================================

-- Columna JSONB para especificaciones estructuradas del trabajo
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}';

-- Dirección exacta del lugar de instalación (más precisa que location_id)
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS address TEXT;

COMMENT ON COLUMN jobs.details IS 'Detalles estructurados: is_height_work, height_meters, requires_special_tools, special_tools_description, special_schedule, surface_type, surface_dimensions, access_details, additional_notes, urgency';
COMMENT ON COLUMN jobs.address IS 'Dirección exacta de la instalación (se muestra al instalador solo tras aceptar su oferta)';
