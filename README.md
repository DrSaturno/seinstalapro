# Se Instala Pro MVP

**Marketplace especializado en instalaciones gráficas** que conecta empresas (imprentas, supermercados, estudios de arquitectura) con instaladores profesionales de servicios gráficos.

## 🎯 Características del MVP

### Para Empresas
- ✅ Registro y perfil empresarial
- ✅ Crear trabajos (categoría, ubicación, presupuesto, imágenes)
- ✅ Recibir ofertas de instaladores
- ✅ Aceptar oferta y coordinar
- ✅ Aprobar trabajo finalizado y calificar
- ✅ Historial de trabajos

### Para Instaladores
- ✅ Registro y perfil profesional
- ✅ Aprobación por admin (requisito para ofertar)
- ✅ Ver trabajos publicados
- ✅ Enviar ofertas
- ✅ Coordinar vía mensajería
- ✅ Subir evidencia final
- ✅ Recibir calificación

### Para Administrador
- ✅ Aprobar trabajos publicados
- ✅ Aprobar/rechazar instaladores
- ✅ Panel operativo
- ✅ Moderar disputas

## 🚀 Stack Tecnológico

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Backend**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod
- **UI**: Lucide Icons + Sonner (toasts)
- **Data**: TanStack Table + React Query

## 📦 Instalación

### Requisitos
- Node.js 20+ 
- pnpm (o npm/yarn)
- Cuenta en Supabase

### Pasos

```bash
# 1. Clonar repositorio
git clone https://github.com/DrSaturno/seinstalapro.git
cd seinstalapro

# 2. Instalar dependencias
pnpm install

# 3. Seguir SETUP-INICIAL.md para configurar Supabase
# (ver docs/SETUP-INICIAL.md)

# 4. Ejecutar en desarrollo
pnpm dev
```

Luego abre: http://localhost:3000

## 📋 Documentación

- [SETUP-INICIAL.md](docs/SETUP-INICIAL.md) - Pasos para configurar el proyecto
- [MVP-FROZEN.md](docs/MVP-FROZEN.md) - Pantallas y features del MVP congelado
- [SCHEMA.md](docs/SCHEMA.md) - Documentación de la base de datos
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Arquitectura técnica

## 📁 Estructura del Proyecto

```
se-instala-pro/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Rutas públicas
│   ├── (empresa)/          # Rutas para empresas
│   ├── (instalador)/       # Rutas para instaladores
│   ├── (admin)/            # Rutas para admin
│   └── api/                # API routes
├── components/             # Componentes reutilizables
├── lib/                    # Utilidades y helpers
├── types/                  # TypeScript types
├── hooks/                  # Custom React hooks
├── supabase/               # SQL y configuración
├── docs/                   # Documentación
└── public/                 # Assets estáticos
```

## 🧪 Testing

```bash
# Tests unitarios
pnpm test

# Tests con cobertura
pnpm test:coverage

# Watch mode
pnpm test:watch
```

## 🔐 Seguridad

- RLS (Row Level Security) activo en todas las tablas
- Datos de contacto ocultos hasta aceptación de oferta
- Instaladores solo pueden ofertar si están aprobados
- Auditoría de todas las acciones críticas

## 📊 SDD - Specification Driven Development

El proyecto sigue **SDD** (Specification Driven Development):
- Tests se escriben PRIMERO basados en especificaciones
- Luego se implementa código que pase los tests
- Red → Green → Refactor

## 🌍 Beta

- **Argentina**
- **Brasil**
- Próximamente: Otros países de LATAM

## 📞 Contacto & Soporte

- Issues: https://github.com/DrSaturno/seinstalapro/issues
- Email: seinstalapro@gmail.com

## 📄 Licencia

Copyright © 2024 Se Instala Pro. Todos los derechos reservados.

---

**Versión**: 0.1.0 (MVP)  
**Estado**: En desarrollo 🚧  
**Última actualización**: Junio 2024
