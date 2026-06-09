-- ============================================================
-- SE INSTALA PRO - SEED DATA FOR DEVELOPMENT
-- ============================================================

-- Insert categories (tipos de trabajos gráficos)
INSERT INTO public.categories (name, description, order_index) VALUES
('Vinilos', 'Instalación de vinilos adhesivos para vehículos, vidrieras, interiores', 1),
('Señalética', 'Señales, placas, direccionales, identificadores', 2),
('Rótulos', 'Rótulos comerciales, luminosos, normales', 3),
('Lonas y Banners', 'Lonas publicitarias y banners para exteriores', 4),
('Letras 3D', 'Letras volumétricas y señalización 3D', 5),
('Publicidad Exterior', 'Vallas, postes, carteles publicitarios', 6),
('Decoración Gráfica', 'Decoración interior, murales, diseños personalizados', 7),
('Cristalería Grabada', 'Vitrinas grabadas, puertas, cristales decorativos', 8)
ON CONFLICT DO NOTHING;

-- Insert locations (Argentina - for MVP beta)
INSERT INTO public.locations (country_code, country_name, province_code, province_name, city_name, zone_name) VALUES
-- Buenos Aires
('AR', 'Argentina', 'BA', 'Buenos Aires', 'Buenos Aires', 'Centro'),
('AR', 'Argentina', 'BA', 'Buenos Aires', 'Buenos Aires', 'Norte'),
('AR', 'Argentina', 'BA', 'Buenos Aires', 'Buenos Aires', 'Sur'),
('AR', 'Argentina', 'BA', 'Buenos Aires', 'La Plata', 'Centro'),
('AR', 'Argentina', 'BA', 'Buenos Aires', 'Quilmes', 'Centro'),
-- Córdoba
('AR', 'Argentina', 'CB', 'Córdoba', 'Córdoba', 'Centro'),
('AR', 'Argentina', 'CB', 'Córdoba', 'Córdoba', 'Norte'),
-- Mendoza
('AR', 'Argentina', 'MZ', 'Mendoza', 'Mendoza', 'Centro'),
-- Brasil - São Paulo
('BR', 'Brasil', 'SP', 'São Paulo', 'São Paulo', 'Centro'),
('BR', 'Brasil', 'SP', 'São Paulo', 'São Paulo', 'Zona Norte'),
('BR', 'Brasil', 'SP', 'São Paulo', 'São Paulo', 'Zona Sul')
ON CONFLICT DO NOTHING;

-- ============================================================
-- TEST DATA ADMIN (no real users - will be created via Auth)
-- ============================================================
-- You'll need to create these users via Supabase Auth UI or CLI
-- Then insert profiles manually or via application

-- Sample companies data (structure only)
-- These will be linked to real auth users when they register

-- Sample installers data (structure only)
-- These will be linked to real auth users when they register
