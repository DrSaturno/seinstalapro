# MVP CONGELADO - Se Instala Pro

**Estado**: CONGELADO - No cambiar sin revisión formal  
**Fecha de congelación**: Junio 2024  
**Versión**: 1.0

---

## 📌 REGLA DE ORO

Todo cambio, feature o mejora DEBE clasificarse como:

✅ **MVP OBLIGATORIO** → Se incluye en los sprints planificados  
🟡 **MVP DESEABLE** → Se evalúa después del MVP funcional  
🔵 **POST-MVP** → Se implementa DESPUÉS de beta  
❌ **NO HACER POR AHORA** → Bloqueado hasta futuro aviso

---

## 🎯 PANTALLAS DEL MVP (13 referencias visuales)

### PÚBLICAS

1. **Home / Landing** (`/`)
   - Propuesta de valor
   - CTA a registro/login
   - MVP: OBLIGATORIO

2. **Cómo funciona** (`/como-funciona`)
   - Explicación para empresa
   - Explicación para instalador
   - MVP: DESEABLE (puede ser simple)

3. **Seleccionar tipo de usuario** (`/registro`)
   - Elegir entre Empresa e Instalador
   - MVP: OBLIGATORIO

4. **Registro Empresa** (`/registro/empresa`)
   - Datos: nombre, email, teléfono, país, provincia, ciudad
   - Validaciones básicas
   - MVP: OBLIGATORIO

5. **Registro Instalador** (`/registro/instalador`)
   - Datos: nombre, email, teléfono, especialidades, zonas
   - Estado: pending_review
   - MVP: OBLIGATORIO

6. **Login** (`/login`)
   - Email + contraseña
   - MVP: OBLIGATORIO

7. **Recuperar contraseña** (`/recuperar-password`)
   - Email + envío de link
   - MVP: DESEABLE (pero importante)

8. **Verificación de email** (`/verificar-email`)
   - Link enviado en email
   - MVP: OBLIGATORIO

### EMPRESA

9. **Dashboard Empresa** (`/empresa/dashboard`)
   - Resumen: trabajos, ofertas, gasto
   - MVP: OBLIGATORIO (versión simple)

10. **Perfil Empresa** (`/empresa/perfil`)
    - Editar datos empresariales
    - MVP: OBLIGATORIO

11. **Mis trabajos** (`/empresa/trabajos`)
    - Lista de trabajos creados
    - Filtros: estado, fecha
    - MVP: OBLIGATORIO

12. **Crear trabajo** (`/empresa/trabajos/nuevo`)
    - Formulario guiado
    - Subir imágenes
    - MVP: OBLIGATORIO

13. **Detalle trabajo** (`/empresa/trabajos/[id]`)
    - Vista completa del trabajo
    - MVP: OBLIGATORIO

14. **Ofertas recibidas** (`/empresa/trabajos/[id]/ofertas`)
    - Lista de ofertas
    - Aceptar/rechazar
    - MVP: OBLIGATORIO

15. **Coordinación** (`/empresa/trabajos/[id]/coordinacion`)
    - Mensajería
    - Confirmar fechas
    - MVP: DESEABLE (básico)

16. **Aprobación trabajo** (`/empresa/trabajos/[id]/revision`)
    - Aprobar/rechazar evidencia
    - Calificar
    - MVP: OBLIGATORIO

### INSTALADOR

17. **Dashboard Instalador** (`/instalador/dashboard`)
    - Resumen: oportunidades, propuestas, ingresos
    - MVP: OBLIGATORIO (versión simple)

18. **Perfil Instalador** (`/instalador/perfil`)
    - Datos profesionales
    - Especialidades
    - Zonas de cobertura
    - MVP: OBLIGATORIO

19. **Trabajos disponibles** (`/instalador/trabajos`)
    - Lista de trabajos publicados
    - Filtros: categoría, zona, presupuesto
    - MVP: OBLIGATORIO

20. **Detalle para ofertar** (`/instalador/trabajos/[id]`)
    - Sin datos de contacto
    - MVP: OBLIGATORIO

21. **Enviar oferta** (`/instalador/trabajos/[id]/ofertar`)
    - Precio, disponibilidad, equipo
    - MVP: OBLIGATORIO

22. **Mis propuestas** (`/instalador/propuestas`)
    - Lista de ofertas enviadas
    - Estados
    - MVP: OBLIGATORIO

23. **Trabajo aceptado** (`/instalador/trabajos-aceptados/[id]`)
    - Coordinación
    - MVP: DESEABLE (básico)

24. **Subir evidencia** (`/instalador/trabajos-aceptados/[id]/evidencia`)
    - Fotos + comentarios
    - Marcar como finalizado
    - MVP: OBLIGATORIO

### ADMIN

25. **Panel Admin** (`/admin/dashboard`)
    - Resumen operativo
    - MVP: OBLIGATORIO (versión simple)

26. **Aprobación de trabajos** (`/admin/trabajos`)
    - Lista de trabajos pending_admin_approval
    - Aprobar/rechazar
    - MVP: OBLIGATORIO

27. **Aprobación de instaladores** (`/admin/instaladores`)
    - Lista de instaladores pending_review
    - Aprobar/rechazar/pedir cambios
    - MVP: OBLIGATORIO

28. **Gestión de usuarios** (`/admin/usuarios`)
    - Buscar, suspender, ver historial
    - MVP: DESEABLE (básico)

---

## ✅ FEATURES OBLIGATORIOS

### AUTH & PERFILES
- [x] Registro empresa con validación
- [x] Registro instalador con validación
- [x] Login con email/contraseña
- [x] Recuperación de contraseña (opcional pero importante)
- [x] Verificación de email
- [x] Roles (company, installer, admin)
- [x] RLS activo en todas las tablas

### EMPRESAS
- [x] Crear trabajos (draft)
- [x] Subir imágenes a trabajos
- [x] Editar trabajo antes de aprobación
- [x] Enviar trabajo a aprobación (pending_admin_approval)
- [x] Ver trabajos propios
- [x] Ver ofertas recibidas
- [x] Aceptar oferta (crea agreement)
- [x] Coordinar con instalador
- [x] Aprobar/rechazar trabajo completado
- [x] Calificar al instalador

### INSTALADORES
- [x] Crear perfil (draft, pending_review)
- [x] Agregar especialidades y zonas
- [x] Ver trabajos publicados (SOLO si están aprobados)
- [x] Enviar ofertas (SOLO si están aprobados)
- [x] Ver mis ofertas
- [x] Coordinar con empresa
- [x] Subir evidencia final
- [x] Marcar trabajo como completado
- [x] Calificar a la empresa

### ADMIN
- [x] Ver trabajos pending_admin_approval
- [x] Aprobar/rechazar trabajos
- [x] Ver instaladores pending_review
- [x] Aprobar/rechazar/pedir cambios instaladores
- [x] Auditar acciones críticas

### GENERAL
- [x] Mensajería interna (job/agreement)
- [x] Notificaciones básicas
- [x] Datos de contacto ocultos hasta agreement
- [x] RLS en todas las tablas
- [x] Buckets de Storage (job_images, portfolios, evidence)

---

## 🚫 FEATURES NO INCLUIDOS EN MVP

### PAGOS & FACTURACIÓN
- ❌ Procesamiento de pagos en app
- ❌ Stripe/Mercado Pago integración
- ❌ Escrow o retención de fondos
- ❌ Facturación fiscal integrada
- ❌ Reportes financieros

### TECHNICAL/AVANZADO
- ❌ App mobile nativa
- ❌ Geolocalización en tiempo real
- ❌ IA para estimación de precios
- ❌ Chat con audio/video
- ❌ Notificaciones push
- ❌ Automatización de aprobaciones
- ❌ Certificaciones pagas

### NICE-TO-HAVE (Bloqueado)
- ❌ Búsqueda avanzada (filtros adicionales)
- ❌ Sistema de recomendaciones
- ❌ Favoritos/wishlist
- ❌ Notificaciones por email (solo en-app)
- ❌ Múltiples monedas (solo ARS para AR, BRL para BR)
- ❌ Integraciones con terceros
- ❌ API pública

---

## 📊 CAMBIOS DE REQUISITOS - PROCESO FORMAL

Si necesita agregar algo al MVP:

1. **Abra un GitHub Issue** con la propuesta
2. **Justifique**: ¿Por qué es MVP y no post-MVP?
3. **Clasifique**: MVP obligatorio / deseable / post-MVP
4. **Estime**: ¿Cuántas horas de desarrollo?
5. **Espere revisión** antes de comenzar

---

## 🔒 RESTRICCIONES DURANTE MVP

- ❌ No agregar nuevas tablas sin aprobación
- ❌ No modificar schema sin aprobación
- ❌ No cambiar RLS sin aprobación
- ❌ No agregar nuevos roles
- ❌ No modificar flujos de auth

---

## ✔️ VALIDACIÓN DE EJECUCIÓN

Antes de marcar MVP como "completado":

- [ ] Todas las 13 pantallas funcionan
- [ ] Auth: registro, login, recuperación funcionan
- [ ] Empresa: crear, editar, publicar trabajos funciona
- [ ] Admin: aprobar trabajos e instaladores funciona
- [ ] Instalador: ver trabajos, ofertar, evidencia funciona
- [ ] RLS: datos de contacto ocult hasta agreement
- [ ] Storage: imágenes se suben correctamente
- [ ] Notificaciones básicas funcionan
- [ ] 80%+ de tests pasando
- [ ] 0 errores críticos

---

**Cambios permitidos solo con revisión formal.**  
**MVP congelado hasta Sprint 8+**

