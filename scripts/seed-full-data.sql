-- ============================================================
-- SE INSTALA PRO - SEED COMPLETO CON DATOS FICTICIOS
-- Ejecutar en Supabase SQL Editor
-- IDEMPOTENTE: se puede ejecutar múltiples veces sin romper
-- ============================================================

-- ============================================================
-- PASO 0: Limpiar datos de seed anteriores (si los hay)
-- Borra solo datos creados por test users, NO datos reales
-- ============================================================

-- Borrar mensajes de acuerdos de test
DELETE FROM messages WHERE agreement_id IN (
  SELECT a.id FROM agreements a
  JOIN companies c ON c.id = a.company_id
  JOIN profiles p ON p.id = c.profile_id
  WHERE p.email LIKE '%@test.com'
);

-- Borrar reseñas de jobs de test
DELETE FROM reviews WHERE job_id IN (
  SELECT j.id FROM jobs j
  JOIN companies c ON c.id = j.company_id
  JOIN profiles p ON p.id = c.profile_id
  WHERE p.email LIKE '%@test.com'
);

-- Borrar acuerdos de test
DELETE FROM agreements WHERE company_id IN (
  SELECT c.id FROM companies c
  JOIN profiles p ON p.id = c.profile_id
  WHERE p.email LIKE '%@test.com'
);

-- Borrar ofertas de jobs de test
DELETE FROM offers WHERE job_id IN (
  SELECT j.id FROM jobs j
  JOIN companies c ON c.id = j.company_id
  JOIN profiles p ON p.id = c.profile_id
  WHERE p.email LIKE '%@test.com'
);

-- Borrar jobs de test
DELETE FROM jobs WHERE company_id IN (
  SELECT c.id FROM companies c
  JOIN profiles p ON p.id = c.profile_id
  WHERE p.email LIKE '%@test.com'
);

-- Borrar skills de instaladores test
DELETE FROM installer_skills WHERE installer_id IN (
  SELECT i.id FROM installers i
  JOIN profiles p ON p.id = i.profile_id
  WHERE p.email LIKE '%@test.com'
);

-- Resetear ratings de instaladores test
UPDATE installers SET avg_rating = 0, total_reviews = 0
WHERE profile_id IN (SELECT id FROM profiles WHERE email LIKE '%@test.com');

-- ============================================================
-- PASO 1: Verificar empresas y aprobar instaladores
-- (los test users ya existen: empresa1-25@test.com, instalador1-50@test.com)
-- ============================================================

-- Verificar las primeras 10 empresas
UPDATE public.companies
SET status = 'verified',
    verified_at = NOW() - INTERVAL '30 days',
    description = CASE
      WHEN company_name = 'Gráfica Mendoza' THEN 'Imprenta de gran formato especializada en cartelería y señalética. Más de 15 años en el rubro.'
      WHEN company_name = 'Vinilos del Plata' THEN 'Empresa líder en vinilos decorativos y vehiculares en la zona sur de Buenos Aires.'
      WHEN company_name = 'Sign Studio' THEN 'Estudio de diseño y producción de señalética corporativa para oficinas y locales comerciales.'
      WHEN company_name = 'Rotulación Pro' THEN 'Fabricación e instalación de rótulos luminosos y no luminosos para comercios.'
      WHEN company_name = 'Impacto Visual' THEN 'Agencia de publicidad exterior con presencia en CABA y GBA. Vallas, carteles y más.'
      ELSE 'Empresa de servicios gráficos y publicidad visual.'
    END,
    website = CASE
      WHEN company_name = 'Gráfica Mendoza' THEN 'https://graficamendoza.com.ar'
      WHEN company_name = 'Vinilos del Plata' THEN 'https://vinilosdelplata.com.ar'
      WHEN company_name = 'Sign Studio' THEN 'https://signstudio.com.ar'
      ELSE NULL
    END,
    city = CASE
      WHEN company_name = 'Gráfica Mendoza' THEN 'Mendoza'
      WHEN company_name = 'Vinilos del Plata' THEN 'Quilmes'
      WHEN company_name = 'Sign Studio' THEN 'Buenos Aires'
      WHEN company_name = 'Rotulación Pro' THEN 'La Plata'
      WHEN company_name = 'Impacto Visual' THEN 'Buenos Aires'
      ELSE 'Buenos Aires'
    END,
    address = CASE
      WHEN company_name = 'Gráfica Mendoza' THEN 'Av. San Martín 450'
      WHEN company_name = 'Vinilos del Plata' THEN 'Calle Rivadavia 1230'
      WHEN company_name = 'Sign Studio' THEN 'Av. Corrientes 3500'
      WHEN company_name = 'Rotulación Pro' THEN 'Calle 7 Nro. 890'
      WHEN company_name = 'Impacto Visual' THEN 'Av. Cabildo 2100'
      ELSE NULL
    END
WHERE profile_id IN (
  SELECT id FROM profiles WHERE email LIKE 'empresa%@test.com'
  ORDER BY email
  LIMIT 10
);

-- Aprobar los primeros 15 instaladores
WITH numbered AS (
  SELECT i.id,
         ROW_NUMBER() OVER (ORDER BY i.created_at) AS rn
  FROM installers i
  WHERE i.profile_id IN (
    SELECT id FROM profiles WHERE email LIKE 'instalador%@test.com'
    ORDER BY email
    LIMIT 15
  )
)
UPDATE public.installers
SET status = 'approved',
    approved_at = NOW() - INTERVAL '25 days',
    bio = CASE numbered.rn % 10
      WHEN 1 THEN 'Instalador profesional con más de 8 años de experiencia en vinilos vehiculares y decorativos. Trabajo prolijo y puntual. Cuento con todas las herramientas necesarias.'
      WHEN 2 THEN 'Especialista en señalética corporativa y rótulos. Experiencia en edificios de oficinas, shoppings y locales comerciales. Trabajo en altura certificado.'
      WHEN 3 THEN 'Técnico en instalaciones gráficas de gran formato. Lonas, banners, vallas publicitarias. Disponibilidad para viajar dentro de Buenos Aires y alrededores.'
      WHEN 4 THEN 'Ploter profesional con experiencia en vidrieras, frentes de locales y decoración de interiores. Uso materiales de primera calidad.'
      WHEN 5 THEN 'Instalador de letras 3D y cartelería luminosa. Trabajo con acrílico, MDF, aluminio compuesto y PVC expandido.'
      WHEN 6 THEN 'Especializado en wrapping vehicular completo y parcial. Certificado en 3M y Avery Dennison. Más de 500 vehículos rotulados.'
      WHEN 7 THEN 'Instalador integral de publicidad exterior. Carteles, vallas, medianeras. Cuento con equipo propio y andamios.'
      WHEN 8 THEN 'Diseñador gráfico e instalador. Ofrezco servicio completo desde el diseño hasta la instalación. Empapelados, murales y vinilos.'
      WHEN 9 THEN 'Técnico matriculado en trabajos en altura. Especialista en instalaciones de gran tamaño en fachadas y medianeras.'
      ELSE 'Instalador gráfico con amplia experiencia en el rubro. Puntualidad, prolijidad y compromiso con cada proyecto.'
    END,
    years_of_experience = CASE numbered.rn % 6
      WHEN 0 THEN 3
      WHEN 1 THEN 8
      WHEN 2 THEN 12
      WHEN 3 THEN 5
      WHEN 4 THEN 15
      WHEN 5 THEN 7
    END
FROM numbered
WHERE installers.id = numbered.id;

-- ============================================================
-- PASO 2: Agregar habilidades a instaladores
-- ============================================================

INSERT INTO public.installer_skills (installer_id, skill_name)
SELECT i.id, skill
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM installers
  WHERE status = 'approved'
) i
CROSS JOIN LATERAL (
  SELECT unnest(
    CASE i.rn % 5
      WHEN 1 THEN ARRAY['Vinilos decorativos', 'Vinilos vehiculares', 'Ploteo de vidrios', 'Micro perforado']
      WHEN 2 THEN ARRAY['Señalética corporativa', 'Letras 3D', 'Rótulos luminosos', 'Publicidad exterior']
      WHEN 3 THEN ARRAY['Lonas publicitarias', 'Banners', 'Instalación en altura', 'Publicidad exterior']
      WHEN 4 THEN ARRAY['Empapelado', 'Vinilos decorativos', 'Calcos / stickers', 'Ploteo de vidrios']
      ELSE ARRAY['Rótulos luminosos', 'Rótulos no luminosos', 'Letras 3D', 'Señalética corporativa', 'Instalación en altura']
    END
  ) AS skill
) skills
ON CONFLICT DO NOTHING;

-- ============================================================
-- PASO 3: Crear trabajos publicados con datos realistas
-- ============================================================

DO $$
DECLARE
  v_company RECORD;
  v_category_id UUID;
  v_location_id UUID;
  v_job_id UUID;
  v_job_count INT := 0;
  v_jobs_data TEXT[][] := ARRAY[
    ARRAY['Vinilado completo de flota de 5 camionetas', 'Necesitamos vinilar 5 camionetas Renault Kangoo con diseño corporativo completo. Incluye laterales, capó y puerta trasera. Material provisto por nosotros (3M IJ380). Plazo: 2 semanas.', 'Vinilos', '80000', '120000'],
    ARRAY['Señalética interior para oficinas corporativas', 'Instalación de sistema de señalética completo para edificio de oficinas: 3 pisos, 45 señales entre direccionales, identificadores de sala y normativa de seguridad. Material: acrílico y vinilo.', 'Señalética', '150000', '200000'],
    ARRAY['Rótulo luminoso para local gastronómico', 'Fabricación e instalación de rótulo luminoso tipo cajón de 4m x 0.80m con letras caladas y LED interno. Incluye estructura, conexión eléctrica y montaje en fachada a 3m de altura.', 'Rótulos', '250000', '350000'],
    ARRAY['Lona publicitaria para evento deportivo', 'Impresión e instalación de 3 lonas de 6m x 3m para evento deportivo en club. Instalación en estructuras existentes. Material: lona front 440g con impresión ecosolvente.', 'Lonas y Banners', '60000', '90000'],
    ARRAY['Letras corpóreas 3D para fachada de farmacia', 'Fabricación e instalación de letras 3D en PVC expandido de 20mm, pintadas, de 40cm de alto. Palabra "FARMACIA" + logo. Montaje en fachada de ladrillo visto.', 'Letras 3D', '180000', '220000'],
    ARRAY['Ploteo de vidriera para local de ropa', 'Diseño e instalación de ploteo decorativo en vidriera de local de indumentaria. 2 vidrios de 2m x 2.5m. Vinilo esmerilado con calado de diseño + vinilo de color para ofertas.', 'Vinilos', '35000', '55000'],
    ARRAY['Cartelería para supermercado - 25 carteles', 'Instalación de 25 carteles de sector (Panadería, Carnicería, Verdulería, etc.) en formato colgante desde techo. Incluye estructura de aluminio y vinilo impreso.', 'Señalética', '120000', '180000'],
    ARRAY['Empapelado mural para restaurante temático', 'Instalación de empapelado fotográfico personalizado en pared de 8m x 3m. Diseño de paisaje con textura anti-humedad. Preparación de superficie incluida.', 'Decoración Gráfica', '90000', '130000'],
    ARRAY['Rotulación de vehículo utilitario', 'Rotulación parcial de Fiat Fiorino con logo, datos de contacto y diseño en laterales y parte trasera. Material: vinilo calandrado con laminado de protección.', 'Vinilos', '25000', '40000'],
    ARRAY['Valla publicitaria 8m x 4m en ruta', 'Instalación de lona impresa en estructura de valla existente en Ruta 2 km 45. Se requiere trabajo en altura (6m). Incluye tensado y fijación con ojales.', 'Publicidad Exterior', '70000', '110000'],
    ARRAY['Decoración integral de stand para exposición', 'Montaje completo de stand de 6m x 4m para feria ExpoGráfica. Incluye backlight, ploteo de paredes, rótulo superior y gráfica de piso. 2 días de montaje.', 'Decoración Gráfica', '200000', '300000'],
    ARRAY['Señalética vial para estacionamiento privado', 'Instalación de señalética vial para estacionamiento de 200 plazas: flechas de piso, numeración de plazas, señales de entrada/salida, carteles de velocidad máxima.', 'Señalética', '95000', '140000'],
    ARRAY['Banners retráctiles x10 para congreso médico', 'Impresión y armado de 10 banners retráctiles (roll-up) de 0.85m x 2m para congreso. Estructura de aluminio + gráfica en lona satinada.', 'Lonas y Banners', '45000', '65000'],
    ARRAY['Frente completo de local comercial', 'Renovación completa de frente de local: rótulo tipo cajón LED de 5m, ploteo de vidriera, vinilo en puerta y marquesina. Todo con diseño unificado.', 'Rótulos', '300000', '450000'],
    ARRAY['Micro perforado para ventanas de oficina', 'Instalación de vinilo micro perforado en 8 ventanas de oficina planta baja. Diseño con logo corporativo. Medida total: 12m lineales x 1.5m de alto.', 'Vinilos', '55000', '75000']
  ];
BEGIN
  FOR v_company IN (
    SELECT c.id, c.company_name
    FROM companies c
    WHERE c.status = 'verified'
    ORDER BY c.created_at
    LIMIT 10
  ) LOOP
    FOR i IN 1..3 LOOP
      v_job_count := v_job_count + 1;
      IF v_job_count > array_length(v_jobs_data, 1) THEN
        v_job_count := 1;
      END IF;

      -- Obtener categoria
      SELECT id INTO v_category_id FROM categories WHERE name = v_jobs_data[v_job_count][3] LIMIT 1;
      -- Obtener location
      SELECT id INTO v_location_id FROM locations ORDER BY RANDOM() LIMIT 1;

      INSERT INTO jobs (
        company_id, title, description, category_id, location_id,
        status, budget_min, budget_max, currency,
        start_date, end_date, files_count, offers_count,
        published_at, created_at,
        details
      ) VALUES (
        v_company.id,
        v_jobs_data[v_job_count][1],
        v_jobs_data[v_job_count][2],
        v_category_id,
        v_location_id,
        CASE
          WHEN i = 1 THEN 'published'::job_status
          WHEN i = 2 THEN 'receiving_offers'::job_status
          ELSE 'published'::job_status
        END,
        v_jobs_data[v_job_count][4]::NUMERIC,
        v_jobs_data[v_job_count][5]::NUMERIC,
        'ARS',
        (NOW() + INTERVAL '7 days')::DATE,
        (NOW() + INTERVAL '30 days')::DATE,
        0, 0,
        NOW() - (RANDOM() * INTERVAL '20 days'),
        NOW() - (RANDOM() * INTERVAL '25 days'),
        jsonb_build_object(
          'urgency', (ARRAY['normal', 'normal', 'high', 'urgent'])[floor(random()*4+1)],
          'is_height_work', (i % 3 = 0),
          'height_meters', CASE WHEN i % 3 = 0 THEN floor(random()*8+3) ELSE NULL END,
          'surface_type', (ARRAY['pared', 'vidrio', 'metal', 'madera', 'vehículo'])[floor(random()*5+1)],
          'surface_dimensions', (floor(random()*8+2) || 'm x ' || floor(random()*4+1) || 'm')
        )
      )
      RETURNING id INTO v_job_id;
    END LOOP;
  END LOOP;
END $$;

-- ============================================================
-- PASO 4: Crear ofertas de instaladores a los trabajos
-- ============================================================

DO $$
DECLARE
  v_job RECORD;
  v_installer RECORD;
  v_offer_count INT;
  v_messages TEXT[] := ARRAY[
    'Hola, me interesa mucho este trabajo. Tengo amplia experiencia en este tipo de instalaciones y cuento con todas las herramientas necesarias. Puedo empezar la semana que viene.',
    'Buenos días, le envío mi propuesta. He realizado trabajos similares para varias empresas de la zona. Garantizo prolijidad y cumplimiento de plazos.',
    'Estoy disponible para este proyecto. Trabajo con materiales de primera calidad y ofrezco garantía de 1 año en la instalación. Adjunto mi propuesta económica.',
    'Me gustaría participar de este proyecto. Cuento con un equipo de 3 personas y podemos realizarlo en tiempo récord manteniendo la calidad.',
    'Hola! Vi la publicación y es justo mi especialidad. Puedo pasar a relevar el lugar sin costo para dar un presupuesto más ajustado si lo prefieren.'
  ];
BEGIN
  FOR v_job IN (
    SELECT j.id, j.budget_min, j.budget_max, j.currency
    FROM jobs j
    WHERE j.status IN ('published', 'receiving_offers')
    ORDER BY j.created_at
  ) LOOP
    v_offer_count := 0;
    FOR v_installer IN (
      SELECT id FROM installers WHERE status = 'approved' ORDER BY RANDOM() LIMIT (floor(random()*4+2))::INT
    ) LOOP
      v_offer_count := v_offer_count + 1;

      INSERT INTO offers (
        job_id, installer_id, status,
        proposed_price, currency,
        team_size, estimated_duration_value,
        availability_start_date, availability_end_date,
        message, submitted_at
      ) VALUES (
        v_job.id,
        v_installer.id,
        CASE
          WHEN v_offer_count = 1 AND random() > 0.5 THEN 'shortlisted'::offer_status
          ELSE 'sent'::offer_status
        END,
        COALESCE(v_job.budget_min, 50000) + floor(random() * COALESCE(v_job.budget_max - v_job.budget_min, 50000)),
        v_job.currency,
        (floor(random()*3+1))::INT,
        (floor(random()*10+2))::INT,
        (NOW() + INTERVAL '5 days')::DATE,
        (NOW() + INTERVAL '20 days')::DATE,
        v_messages[floor(random()*5+1)],
        NOW() - (random() * INTERVAL '10 days')
      );
    END LOOP;

    -- Actualizar offers_count
    UPDATE jobs SET offers_count = v_offer_count WHERE id = v_job.id;

    -- Si tiene ofertas, cambiar a receiving_offers
    IF v_offer_count > 0 THEN
      UPDATE jobs SET status = 'receiving_offers'::job_status WHERE id = v_job.id AND status = 'published'::job_status;
    END IF;
  END LOOP;
END $$;

-- ============================================================
-- PASO 5: Crear algunos trabajos completados con acuerdos y reseñas
-- ============================================================

DO $$
DECLARE
  v_company RECORD;
  v_installer RECORD;
  v_category_id UUID;
  v_location_id UUID;
  v_job_id UUID;
  v_offer_id UUID;
  v_agreement_id UUID;
  v_completed_jobs TEXT[][] := ARRAY[
    ARRAY['Vinilado de flota corporativa - 3 vehículos', 'Se vinilaron 3 utilitarios con branding corporativo completo. Trabajo impecable.', 'Vinilos', '95000'],
    ARRAY['Señalética completa para clínica dental', 'Instalación de 20 señales entre directorios, identificadores y normativas.', 'Señalética', '85000'],
    ARRAY['Rótulo luminoso LED para panadería', 'Cajón luminoso de 3m con letras caladas. Quedó espectacular.', 'Rótulos', '180000'],
    ARRAY['Ploteo navideño de vidriera', 'Decoración estacional de 3 vidrieras con vinilos removibles.', 'Vinilos', '28000'],
    ARRAY['Banner para inauguración de local', 'Impresión e instalación de lona de 4x2m para inauguración.', 'Lonas y Banners', '32000']
  ];
  v_reviews TEXT[] := ARRAY[
    'Excelente trabajo, muy profesional y puntual. El resultado superó nuestras expectativas. Lo recomiendo 100%.',
    'Muy buen trabajo, prolijo y en tiempo. La comunicación fue clara desde el principio. Volveremos a contratarlo.',
    'Trabajo impecable. Se nota la experiencia. Cumplió con todo lo pactado y el resultado final es de primera calidad.',
    'Buen instalador, resolvió algunos imprevistos con mucha habilidad. El acabado final quedó perfecto.',
    'Excelente profesional. Llegó puntual, trabajó limpio y el resultado final es increíble. Totalmente recomendable.'
  ];
  v_counter INT := 0;
BEGIN
  FOR v_company IN (
    SELECT c.id, c.profile_id
    FROM companies c
    WHERE c.status = 'verified'
    ORDER BY c.created_at
    LIMIT 5
  ) LOOP
    v_counter := v_counter + 1;

    SELECT id INTO v_installer FROM installers WHERE status = 'approved' ORDER BY RANDOM() LIMIT 1;
    SELECT id INTO v_category_id FROM categories WHERE name = v_completed_jobs[v_counter][3] LIMIT 1;
    SELECT id INTO v_location_id FROM locations ORDER BY RANDOM() LIMIT 1;

    -- Crear job completado
    INSERT INTO jobs (
      company_id, title, description, category_id, location_id,
      status, budget_min, budget_max, currency,
      published_at, created_at, files_count, offers_count,
      details
    ) VALUES (
      v_company.id,
      v_completed_jobs[v_counter][1],
      v_completed_jobs[v_counter][2],
      v_category_id, v_location_id,
      'rated'::job_status,
      v_completed_jobs[v_counter][4]::NUMERIC,
      (v_completed_jobs[v_counter][4]::NUMERIC * 1.3)::NUMERIC,
      'ARS',
      NOW() - INTERVAL '60 days',
      NOW() - INTERVAL '65 days',
      0, 1,
      '{"urgency": "normal"}'::JSONB
    )
    RETURNING id INTO v_job_id;

    -- Crear oferta aceptada
    INSERT INTO offers (
      job_id, installer_id, status,
      proposed_price, currency,
      team_size, estimated_duration_value,
      message, submitted_at, accepted_at
    ) VALUES (
      v_job_id, v_installer.id, 'accepted'::offer_status,
      v_completed_jobs[v_counter][4]::NUMERIC,
      'ARS', 2, 5,
      'Me encantaría realizar este trabajo. Tengo experiencia en proyectos similares.',
      NOW() - INTERVAL '58 days',
      NOW() - INTERVAL '55 days'
    )
    RETURNING id INTO v_offer_id;

    -- Crear acuerdo completado
    INSERT INTO agreements (
      job_id, offer_id, company_id, installer_id,
      status, final_price, currency,
      confirmed_start_date, confirmed_end_date,
      created_at
    ) VALUES (
      v_job_id, v_offer_id, v_company.id, v_installer.id,
      'completed'::agreement_status,
      v_completed_jobs[v_counter][4]::NUMERIC,
      'ARS',
      (NOW() - INTERVAL '50 days')::DATE,
      (NOW() - INTERVAL '45 days')::DATE,
      NOW() - INTERVAL '55 days'
    )
    RETURNING id INTO v_agreement_id;

    -- Crear reseña
    INSERT INTO reviews (
      job_id, agreement_id,
      reviewer_id, reviewed_id,
      rating, comment,
      created_at
    ) VALUES (
      v_job_id, v_agreement_id,
      v_company.profile_id,
      (SELECT profile_id FROM installers WHERE id = v_installer.id),
      (ARRAY[4, 5, 5, 4, 5])[v_counter],
      v_reviews[v_counter],
      NOW() - INTERVAL '40 days'
    );

    -- Actualizar rating del instalador
    UPDATE installers SET
      avg_rating = (
        SELECT ROUND(AVG(rating)::NUMERIC, 1)
        FROM reviews
        WHERE reviewed_id = (SELECT profile_id FROM installers WHERE id = v_installer.id)
      ),
      total_reviews = (
        SELECT COUNT(*)
        FROM reviews
        WHERE reviewed_id = (SELECT profile_id FROM installers WHERE id = v_installer.id)
      )
    WHERE id = v_installer.id;

  END LOOP;
END $$;

-- ============================================================
-- PASO 6: Crear algunos trabajos en progreso con acuerdos activos
-- ============================================================

DO $$
DECLARE
  v_company RECORD;
  v_installer RECORD;
  v_category_id UUID;
  v_location_id UUID;
  v_job_id UUID;
  v_offer_id UUID;
  v_in_progress_jobs TEXT[][] := ARRAY[
    ARRAY['Instalación de backlight para tienda de electrónica', 'Retroiluminación LED con gráfica translúcida para exhibidor de 3m x 2m.', 'Rótulos', '140000'],
    ARRAY['Wrapping completo de camión de reparto', 'Vinilado integral de camión Mercedes Sprinter con diseño de marca.', 'Vinilos', '200000'],
    ARRAY['Mural fotográfico para hotel boutique', 'Impresión e instalación de mural de 5m x 3m en lobby del hotel.', 'Decoración Gráfica', '110000']
  ];
  v_counter INT := 0;
BEGIN
  FOR v_company IN (
    SELECT c.id, c.profile_id
    FROM companies c
    WHERE c.status = 'verified'
    ORDER BY c.created_at
    LIMIT 3
  ) LOOP
    v_counter := v_counter + 1;

    SELECT id INTO v_installer FROM installers WHERE status = 'approved' ORDER BY RANDOM() LIMIT 1;
    SELECT id INTO v_category_id FROM categories WHERE name = v_in_progress_jobs[v_counter][3] LIMIT 1;
    SELECT id INTO v_location_id FROM locations ORDER BY RANDOM() LIMIT 1;

    INSERT INTO jobs (
      company_id, title, description, category_id, location_id,
      status, budget_min, budget_max, currency,
      published_at, created_at, files_count, offers_count,
      details
    ) VALUES (
      v_company.id,
      v_in_progress_jobs[v_counter][1],
      v_in_progress_jobs[v_counter][2],
      v_category_id, v_location_id,
      'in_progress'::job_status,
      v_in_progress_jobs[v_counter][4]::NUMERIC,
      (v_in_progress_jobs[v_counter][4]::NUMERIC * 1.2)::NUMERIC,
      'ARS',
      NOW() - INTERVAL '15 days',
      NOW() - INTERVAL '20 days',
      0, 1,
      jsonb_build_object('urgency', 'high', 'is_height_work', v_counter = 1)
    )
    RETURNING id INTO v_job_id;

    INSERT INTO offers (
      job_id, installer_id, status,
      proposed_price, currency,
      team_size, estimated_duration_value,
      message, submitted_at, accepted_at
    ) VALUES (
      v_job_id, v_installer.id, 'accepted'::offer_status,
      v_in_progress_jobs[v_counter][4]::NUMERIC,
      'ARS', 2, 7,
      'Estoy listo para arrancar con este proyecto. Cuento con la experiencia necesaria.',
      NOW() - INTERVAL '12 days',
      NOW() - INTERVAL '10 days'
    )
    RETURNING id INTO v_offer_id;

    INSERT INTO agreements (
      job_id, offer_id, company_id, installer_id,
      status, final_price, currency,
      confirmed_start_date, confirmed_end_date,
      created_at
    ) VALUES (
      v_job_id, v_offer_id, v_company.id, v_installer.id,
      'in_progress'::agreement_status,
      v_in_progress_jobs[v_counter][4]::NUMERIC,
      'ARS',
      NOW()::DATE,
      (NOW() + INTERVAL '14 days')::DATE,
      NOW() - INTERVAL '10 days'
    );
  END LOOP;
END $$;

-- ============================================================
-- PASO 7: Crear mensajes entre empresas e instaladores
-- ============================================================

DO $$
DECLARE
  v_agreement RECORD;
  v_messages_data TEXT[][] := ARRAY[
    ARRAY['company', 'Hola! Quería confirmar el horario de mañana para la instalación.'],
    ARRAY['installer', 'Hola! Sí, estoy confirmado para las 9hs. Llego con mi equipo de 2 personas.'],
    ARRAY['company', 'Perfecto. Te esperamos. La puerta del depósito va a estar abierta.'],
    ARRAY['installer', 'Genial, muchas gracias. Llevamos todo el material necesario.'],
    ARRAY['company', 'Una consulta, ¿necesitás acceso a electricidad para las herramientas?'],
    ARRAY['installer', 'Sí, vamos a necesitar un enchufe cerca del área de trabajo. Con uno alcanza.']
  ];
BEGIN
  FOR v_agreement IN (
    SELECT a.id, a.job_id,
           c.profile_id as company_profile_id,
           i.profile_id as installer_profile_id
    FROM agreements a
    JOIN companies c ON c.id = a.company_id
    JOIN installers i ON i.id = a.installer_id
    WHERE a.status IN ('in_progress', 'completed')
    LIMIT 3
  ) LOOP
    FOR i IN 1..6 LOOP
      INSERT INTO messages (
        agreement_id, job_id,
        sender_id, recipient_id,
        message_text, is_read,
        created_at
      ) VALUES (
        v_agreement.id,
        v_agreement.job_id,
        CASE WHEN v_messages_data[i][1] = 'company'
          THEN v_agreement.company_profile_id
          ELSE v_agreement.installer_profile_id
        END,
        CASE WHEN v_messages_data[i][1] = 'company'
          THEN v_agreement.installer_profile_id
          ELSE v_agreement.company_profile_id
        END,
        v_messages_data[i][2],
        true,
        NOW() - INTERVAL '5 days' + (i * INTERVAL '30 minutes')
      );
    END LOOP;
  END LOOP;
END $$;

-- ============================================================
-- RESULTADO ESPERADO
-- ============================================================
-- 10 empresas verificadas con datos completos
-- 15 instaladores aprobados con bio y habilidades
-- ~30 trabajos publicados/receiving_offers con ofertas
-- 5 trabajos completados con acuerdos y reseñas
-- 3 trabajos en progreso con acuerdos activos
-- Mensajes entre las partes
-- ============================================================

SELECT 'Seed completado!' AS resultado,
  (SELECT COUNT(*) FROM companies WHERE status = 'verified') AS empresas_verificadas,
  (SELECT COUNT(*) FROM installers WHERE status = 'approved') AS instaladores_aprobados,
  (SELECT COUNT(*) FROM jobs WHERE status IN ('published', 'receiving_offers')) AS trabajos_activos,
  (SELECT COUNT(*) FROM jobs WHERE status = 'rated') AS trabajos_completados,
  (SELECT COUNT(*) FROM jobs WHERE status = 'in_progress') AS trabajos_en_progreso,
  (SELECT COUNT(*) FROM offers) AS total_ofertas,
  (SELECT COUNT(*) FROM agreements) AS total_acuerdos,
  (SELECT COUNT(*) FROM reviews) AS total_resenas,
  (SELECT COUNT(*) FROM messages) AS total_mensajes;
