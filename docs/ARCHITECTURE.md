# ARQUITECTURA TÉCNICA - Se Instala Pro MVP

## 🏗️ Diagrama General

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (Next.js)                    │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Pages (Auth, Company, Installer, Admin)         │   │
│  │  Components (Cards, Forms, Shared)               │   │
│  │  Hooks (useAuth, useTrabajo, useOffer)           │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────┘
                       │ (HTTP)
                       ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND - SUPABASE                         │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  AUTH (Supabase Auth)                          │   │
│  │  - Email/Password                              │   │
│  │  - JWT Tokens                                  │   │
│  └─────────────────────────────────────────────────┘   │
│                       │                                 │
│  ┌────────────────────▼────────────────────────────┐   │
│  │  DATABASE (PostgreSQL)                         │   │
│  │  - Profiles, Companies, Installers             │   │
│  │  - Jobs, Offers, Agreements                    │   │
│  │  - Messages, Reviews, Disputes                 │   │
│  │  - RLS Active en todas las tablas              │   │
│  └─────────────────────────────────────────────────┘   │
│                       │                                 │
│  ┌────────────────────▼────────────────────────────┐   │
│  │  STORAGE (Supabase Storage)                    │   │
│  │  - job_images                                  │   │
│  │  - installer_portfolios                        │   │
│  │  - evidence                                    │   │
│  │  - dispute_evidence                            │   │
│  │  - verification_documents                      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 STACK TECNOLÓGICO

### Frontend
- **Next.js 14** - React framework, App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Hook Form + Zod** - Form validation
- **TanStack Table** - Data tables
- **TanStack React Query** - Data fetching
- **Lucide Icons** - Icons
- **Sonner** - Toast notifications

### Backend
- **Supabase** - PostgreSQL + Auth
- **PostgreSQL** - Database
- **Row Level Security** - Authorization
- **Supabase Storage** - File uploads

### Testing (SDD)
- **Jest** - Unit testing framework
- **React Testing Library** - Component testing
- **Supertest** - API testing (si aplica)

---

## 🗄️ ARQUITECTURA DE BASE DE DATOS

### Tablas Principales (14)

```
profiles ──┬──> companies
           ├──> installers ──> installer_skills
           ├──> jobs ──────────────────────────┐
           │                                   │
           ├──> offers ──────────> agreements  │
           │                           │       │
           ├──> messages <─────────────┴───────┴──┐
           │                                     │
           ├──> reviews <───────────────────────┐│
           │                                    ││
           ├──> disputes <──────────────────────┼┘
           │                                    │
           ├──> notifications                  │
           │                                    │
           └──> audit_logs                     │
                                               │
          job_files (pertenece a jobs)          │
          location (independiente, referenciada)
          categories (independiente, referenciada)
```

### Principios de Diseño

1. **Normalización**: Minimal redundancia
2. **RLS Activo**: Toda tabla tiene políticas de acceso
3. **Timestamps**: `created_at`, `updated_at` en tablas transaccionales
4. **Soft Deletes**: Usar status en lugar de DELETE
5. **Auditoría**: `audit_logs` registra cambios críticos

---

## 🔐 SEGURIDAD - RLS POLICIES

### Reglas Generales

```
Profiles:
├─ Users can see/edit own profile
└─ Admins can see/edit all

Companies:
├─ Company can see/edit own
├─ Others can see if verified
└─ Admins can see/edit all

Installers:
├─ Installer can see/edit own
├─ Others can see if approved
└─ Admins can see/edit all

Jobs:
├─ Company can see/edit own
├─ Installers (approved) can see published
└─ Admins can see/edit all

Offers:
├─ Installer can see own
├─ Company can see offers for own jobs
└─ Admins can see all

Agreements:
├─ Company & Installer can see own
└─ Admins can see all

Contact Data (Hidden until Agreement):
├─ Email, phone, address hidden on Installer profile
├─ Revealed when Agreement created
└─ Company sees installer contact only after accepting
```

---

## 📁 ESTRUCTURA DE CARPETAS

```
se-instala-pro/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Layout público
│   │   ├── login/page.tsx
│   │   ├── registro/page.tsx
│   │   └── layout.tsx
│   │
│   ├── (empresa)/                    # Layout empresa
│   │   ├── dashboard/page.tsx
│   │   ├── perfil/page.tsx
│   │   ├── trabajos/page.tsx
│   │   ├── trabajos/nuevo/page.tsx
│   │   ├── trabajos/[id]/page.tsx
│   │   ├── trabajos/[id]/ofertas/page.tsx
│   │   └── layout.tsx
│   │
│   ├── (instalador)/                 # Layout instalador
│   │   ├── dashboard/page.tsx
│   │   ├── perfil/page.tsx
│   │   ├── trabajos/page.tsx
│   │   ├── trabajos/[id]/page.tsx
│   │   ├── propuestas/page.tsx
│   │   └── layout.tsx
│   │
│   ├── (admin)/                      # Layout admin
│   │   ├── dashboard/page.tsx
│   │   ├── trabajos/page.tsx
│   │   ├── instaladores/page.tsx
│   │   └── layout.tsx
│   │
│   ├── api/                          # API routes (si aplica)
│   │   └── health/route.ts           # Health check
│   │
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Home
│   └── globals.css                   # Global styles
│
├── components/                       # Reutilizables
│   ├── shared/
│   │   ├── AppSidebar.tsx
│   │   ├── Topbar.tsx
│   │   └── Layout.tsx
│   │
│   ├── forms/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── CreateJobForm.tsx
│   │   └── OfferForm.tsx
│   │
│   ├── cards/
│   │   ├── JobCard.tsx
│   │   ├── OfferCard.tsx
│   │   ├── InstallerCard.tsx
│   │   └── CompanyCard.tsx
│   │
│   └── ui/
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Modal.tsx
│       ├── Loading.tsx
│       └── EmptyState.tsx
│
├── lib/                              # Utilidades
│   ├── supabase.ts                   # Cliente
│   ├── auth.ts                       # Auth helpers
│   ├── constants.ts                  # Constantes
│   └── utils.ts                      # Helpers
│
├── types/                            # TypeScript
│   ├── database.ts                   # Tipos de DB
│   ├── forms.ts                      # Tipos de forms
│   └── business.ts                   # Tipos del negocio
│
├── hooks/                            # Custom hooks
│   ├── useAuth.ts
│   ├── useUser.ts
│   ├── useTrabajo.ts
│   ├── useOffer.ts
│   └── useCompany.ts
│
├── supabase/                         # SQL
│   ├── schema.sql
│   ├── rls.sql
│   ├── seed.sql
│   └── functions.sql
│
├── docs/                             # Documentación
│   ├── SETUP-INICIAL.md
│   ├── MVP-FROZEN.md
│   ├── ARCHITECTURE.md
│   └── SCHEMA.md
│
├── public/                           # Assets estáticos
├── .env.local                        # Variables (no commitear)
├── .env.local.example                # Template
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
└── README.md
```

---

## 🔄 FLUJOS DE DATOS

### 1. REGISTRO - Empresa

```
1. Usuario completa LoginForm
2. Form validado con Zod
3. Supabase.auth.signUp()
4. Profile creado via RLS trigger (o manual)
5. Company record insertado
6. User redirigido a /empresa/dashboard
```

### 2. PUBLICAR TRABAJO - Empresa

```
1. Empresa en /empresa/trabajos/nuevo
2. Completa CreateJobForm
3. Sube imágenes a job_images bucket
4. Job creado con status='draft'
5. Empresa hace submit → status='pending_admin_approval'
6. Notificación al admin
```

### 3. APROBAR TRABAJO - Admin

```
1. Admin ve /admin/trabajos (pending_admin_approval)
2. Revisa job + imágenes
3. Click "Aprobar"
4. Job status → 'published'
5. Notificación a empresa
6. Instaladores ven job en /instalador/trabajos
```

### 4. OFERTAR - Instalador

```
1. Instalador (aprobado) ve /instalador/trabajos
2. Click en job → /instalador/trabajos/[id]
3. Completa OfferForm (sin ver datos de contacto)
4. Submit offer
5. Offer creado con status='sent'
6. Notificación a empresa
```

### 5. ACEPTAR OFERTA - Empresa

```
1. Empresa ve /empresa/trabajos/[id]/ofertas
2. Compara ofertas
3. Click "Aceptar" en una oferta
4. Agreement creado
5. Offer status → 'accepted'
6. Job status → 'offer_accepted'
7. Datos de contacto se revelan
8. Both can see chat y coordinar
```

---

## 🚀 DEPLOYMENT

### Desarrollo
- Local: `pnpm dev` → http://localhost:3000

### Staging (opcional)
- Deploy a Vercel con branch `develop`
- Supabase staging project

### Producción
- Deploy a Vercel con branch `main`
- Supabase prod project
- Dominios: seinstalapro.com(.ar|.br)

---

## 📊 PERFORMANCE

### Caching
- Next.js: ISR para páginas estáticas
- Supabase: Índices en columnas frecuentes
- React Query: Caching de queries

### Optimizaciones
- Code splitting automático en Next.js
- Lazy loading de componentes
- Imágenes optimizadas con next/image
- Debouncing en búsquedas

---

## 🧪 TESTING STRATEGY (SDD)

### Unit Tests
- Helpers y utils
- Custom hooks
- Validaciones Zod

### Integration Tests
- Flujos de auth
- CRUD de tablas principales
- RLS policies

### E2E Tests (post-MVP)
- User journeys completos
- Admin workflows

### Coverage Target
- 80%+ por feature
- 100% en auth y RLS

---

## 🔄 CI/CD Pipeline

```
Git Push
    ↓
GitHub Actions
    ├── Lint (ESLint)
    ├── Type Check (TypeScript)
    ├── Tests (Jest)
    └── Build (Next.js)
         ↓ si pasa
    Deploy a Vercel
         ↓
    Staging / Producción
```

---

## 📈 SCALING (Post-MVP)

1. **Database**: Partitioning de tables grandes (jobs, messages)
2. **Storage**: CDN para imágenes (Cloudflare, Supabase CDN)
3. **API**: API layer separada si es necesario
4. **Cache**: Redis para sessions/cache
5. **Async**: Queue para procesamiento (Stripe webhooks, emails)

---

**Arquitectura documentada**  
**Siguiente: Sprint 0 Setup completo**
