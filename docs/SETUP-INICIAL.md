# Setup Inicial - Se Instala Pro MVP

## 🚀 Pasos de Setup

### PASO 1: Clonar repositorio

```bash
git clone https://github.com/DrSaturno/seinstalapro.git
cd seinstalapro
```

### PASO 2: Instalar dependencias

```bash
pnpm install
```

o si usas npm:
```bash
npm install
```

### PASO 3: Crear base de datos en Supabase

**3.1 Ejecutar Schema SQL**

1. Abre: https://app.supabase.com/project/jibvorqudveqgankoeak
2. Ve a: **SQL Editor** (columna izquierda)
3. Abre un nuevo script SQL
4. Copia todo el contenido de: `supabase/schema.sql`
5. Pega en el editor y ejecuta (Ctrl+Enter)
6. Espera a que termine ✅

**3.2 Ejecutar RLS Policies**

1. Abre un nuevo script SQL
2. Copia todo el contenido de: `supabase/rls.sql`
3. Pega en el editor y ejecuta
4. Espera a que termine ✅

**3.3 Ejecutar Seed Data**

1. Abre un nuevo script SQL
2. Copia todo el contenido de: `supabase/seed.sql`
3. Pega en el editor y ejecuta
4. Espera a que termine ✅

### PASO 4: Crear Buckets de Storage

En Supabase:

1. Ve a: **Storage** (columna izquierda)
2. Crea estos buckets (botón "+ New bucket"):
   - `job_images` (público)
   - `installer_portfolios` (público)
   - `evidence` (privado)
   - `dispute_evidence` (privado)
   - `verification_documents` (privado)

### PASO 5: Configurar Variables de Entorno

El archivo `.env.local` ya tiene las credenciales configuradas.

Verificar:
```bash
cat .env.local
```

Debe contener:
```
NEXT_PUBLIC_SUPABASE_URL=https://jibvorqudveqgankoeak.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### PASO 6: Ejecutar proyecto en desarrollo

```bash
pnpm dev
```

o:
```bash
npm run dev
```

Luego abre: http://localhost:3000

---

## 🧪 Testing de Conexión

1. Ve a http://localhost:3000/login
2. Intenta registrarte (signup)
3. Debería funcionar y crear un profile en Supabase

Si falla, verifica:
- ✅ Las tablas se crearon en Supabase (ve a SQL Editor → SELECT count(*) FROM public.profiles;)
- ✅ RLS está activo (ve a Authentication → Policies)
- ✅ Las credenciales en `.env.local` son correctas

---

## 📋 Checklist de Verificación

- [ ] Repositorio clonado
- [ ] npm/pnpm instalado
- [ ] Schema SQL ejecutado
- [ ] RLS Policies ejecutadas
- [ ] Seed Data ejecutado
- [ ] Buckets de Storage creados
- [ ] `.env.local` verificado
- [ ] `pnpm dev` ejecutándose
- [ ] http://localhost:3000 abierto
- [ ] Login/Signup funciona

---

## 🆘 Troubleshooting

### Error: "No tables found"
→ No ejecutaste el schema.sql. Ve a PASO 3.1

### Error: "RLS policy violation"
→ No ejecutaste el rls.sql. Ve a PASO 3.2

### Error: "NEXT_PUBLIC_SUPABASE_URL not set"
→ Falta .env.local. Copia .env.local.example → .env.local

### Error: "Bucket not found"
→ No creaste los buckets. Ve a PASO 4

---

## 📞 Contacto

Si algo no funciona, revisa:
- README.md
- docs/ARCHITECTURE.md
- GitHub Issues
