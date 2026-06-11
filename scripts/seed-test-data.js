/**
 * SEED DE DATOS DE PRUEBA - Se Instala Pro
 *
 * Crea 25 empresas, 50 instaladores, 30 trabajos, ofertas, acuerdos, reseñas
 * y todo el movimiento normal de la app.
 *
 * USO: node scripts/seed-test-data.js
 *
 * Requiere: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local
 */

require('dotenv').config({ path: '.env.local' })
const WebSocket = require('ws')
global.WebSocket = WebSocket
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { enabled: false },
  db: { schema: 'public' },
})

// ============================================================
// DATOS
// ============================================================

const COMPANY_NAMES = [
  'Vinilo Express BA', 'Señalética Total', 'Rótulos del Sur', 'Gráfica Urbana',
  'Instalaciones Premium', 'Display Argentina', 'Cartelería Digital', 'Visual Impact',
  'Deco Vinilos', 'Print & Install', 'Urban Signs', 'Mega Gráfica',
  'Letreros Pro', 'Arte en Vinilo', 'Señales y Más', 'Gráfica Industrial',
  'Publicidad Visual', 'Banner Express', 'Letras 3D Argentina', 'Cristal Design',
  'Impacto Visual', 'Rotulación Pro', 'Sign Studio', 'Vinilos del Plata',
  'Gráfica Mendoza'
]

const INSTALLER_NAMES = [
  'Martín Rodríguez', 'Luciana Fernández', 'Diego González', 'Carolina Pérez',
  'Pablo Sánchez', 'Valentina López', 'Andrés Martínez', 'Sofía García',
  'Federico Torres', 'Camila Ruiz', 'Joaquín Díaz', 'Florencia Morales',
  'Sebastián Romero', 'Agustina Sosa', 'Nicolás Acosta', 'Milagros Herrera',
  'Tomás Medina', 'Julieta Flores', 'Ignacio Castro', 'Rocío Aguirre',
  'Matías Peralta', 'Daniela Cabrera', 'Lucas Molina', 'Antonella Vargas',
  'Emiliano Ríos', 'Victoria Luna', 'Santiago Paz', 'Candela Giménez',
  'Lautaro Ortiz', 'Micaela Ramírez', 'Franco Suárez', 'Belén Navarro',
  'Ezequiel Rojas', 'Ludmila Gutiérrez', 'Leandro Domínguez', 'Abril Figueroa',
  'Gastón Álvarez', 'Renata Benítez', 'Damián Vega', 'Celeste Campos',
  'Maximiliano Reyes', 'Pilar Córdoba', 'Thiago Miranda', 'Luz Espinoza',
  'Bautista Ojeda', 'Alma Ponce', 'Ramiro Cardozo', 'Sol Aguilar',
  'Gonzalo Paredes', 'Jazmín Villalba'
]

const JOB_TITLES = [
  'Ploteo completo de vidriera comercial',
  'Instalación de señalética industrial en planta',
  'Rótulo luminoso para fachada de local',
  'Vinilo decorativo para oficinas corporativas',
  'Banner de gran formato para evento',
  'Letras 3D en acero inoxidable para edificio',
  'Ploteo vehicular flota de 5 camionetas',
  'Señalética de seguridad para obra en construcción',
  'Vinilo esmerilado para sala de reuniones',
  'Cartelería exterior resistente a intemperie',
  'Decoración gráfica para local gastronómico',
  'Instalación de lona tensada 6x3 metros',
  'Ploteo de vidriera temporada verano',
  'Señalización vial para estacionamiento',
  'Rótulo corpóreo iluminado con LED',
  'Vinilo microperforado para ventanas de oficina',
  'Gráfica integral para stand de exposición',
  'Ploteo de pared interior con diseño custom',
  'Letras corpóreas de PVC para consultorio',
  'Banners roll-up para congreso médico',
  'Señalética inclusiva con braille para hotel',
  'Vinilo de piso antideslizante para shopping',
  'Cartelería de menú para cadena de restaurantes',
  'Ploteo de frente comercial completo',
  'Instalación de backlight para publicidad',
  'Gráfica vehicular para ambulancia',
  'Señalización de emergencia para edificio',
  'Vinilo decorativo para habitaciones de hotel',
  'Rótulo con relieve para estudio jurídico',
  'Ploteo integral para showroom automotriz'
]

const JOB_DESCRIPTIONS = [
  'Se necesita instalador con experiencia en ploteo de vidrieras. El trabajo incluye medición, corte e instalación de vinilo de alta calidad. La vidriera tiene 4 paños de 1.5x2m cada uno.',
  'Proyecto de señalética completa para planta industrial. Incluye señales de seguridad, evacuación, y circulación. Aproximadamente 80 señales en total.',
  'Fabricación e instalación de rótulo luminoso con estructura de aluminio y frente de acrílico. Medidas: 3x0.8m. Incluye iluminación LED.',
  'Ploteo decorativo con diseño corporativo para 3 pisos de oficinas. Incluye logos, frases motivacionales y gráficos en paredes y vidrios.',
  'Impresión e instalación de banner de 8x4m para evento corporativo al aire libre. Material resistente a viento y lluvia.',
  'Letras 3D en acero inoxidable cepillado, altura 30cm. Texto: nombre de empresa (12 letras). Instalación en fachada de mármol.',
]

const PASSWORD = 'Test123456!'

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomDate(daysBack) {
  const d = new Date()
  d.setDate(d.getDate() - randomInt(1, daysBack))
  return d.toISOString()
}

// ============================================================
// CREAR USUARIOS
// ============================================================

async function createUser(email, fullName, role) {
  // Verificar si ya existe
  const { data: existing } = await supabase.auth.admin.listUsers()
  const found = existing?.users?.find(u => u.email === email)
  if (found) {
    console.log(`  ⏭️  ${email} ya existe`)
    return found.id
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: fullName, role }
  })

  if (error) {
    console.error(`  ❌ Error creando ${email}:`, error.message)
    return null
  }

  console.log(`  ✅ ${email} creado`)
  return data.user.id
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('\n🚀 SEED DE DATOS DE PRUEBA - Se Instala Pro\n')
  console.log('='.repeat(50))

  // --- Obtener categorías y ubicaciones existentes ---
  console.log('\n📋 Obteniendo categorías y ubicaciones...')
  const { data: categories } = await supabase.from('categories').select('id, name').eq('is_active', true)
  const { data: locations } = await supabase.from('locations').select('id, city_name, country_code').eq('is_active', true)

  if (!categories?.length || !locations?.length) {
    console.error('❌ No hay categorías o ubicaciones. Ejecutá el seed de la DB primero.')
    process.exit(1)
  }

  console.log(`  ${categories.length} categorías, ${locations.length} ubicaciones`)
  const arLocations = locations.filter(l => l.country_code === 'AR')

  // --- Crear Admin (nicolas) ---
  console.log('\n👑 Verificando admin...')
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', 'nicolas.galarza87@gmail.com')
    .single()

  if (adminProfile) {
    await supabase.from('profiles').update({ role: 'admin' }).eq('id', adminProfile.id)
    console.log('  ✅ nicolas.galarza87@gmail.com → admin')
  }

  // --- Crear 25 Empresas ---
  console.log('\n🏢 Creando 25 empresas...')
  const companyIds = [] // { userId, companyId }

  for (let i = 0; i < COMPANY_NAMES.length; i++) {
    const name = COMPANY_NAMES[i]
    const email = `empresa${i + 1}@test.com`

    const userId = await createUser(email, name, 'company')
    if (!userId) continue

    // Crear perfil
    await supabase.from('profiles').upsert({
      id: userId,
      email,
      full_name: name,
      role: 'company',
      country_code: 'AR',
      status: 'active',
      phone: `+5411${randomInt(40000000, 49999999)}`,
    }, { onConflict: 'id' })

    // Crear empresa
    const companyStatus = i < 20 ? 'verified' : 'pending_review'
    const { data: company } = await supabase.from('companies').upsert({
      profile_id: userId,
      company_name: name,
      country: 'AR',
      city: randomItem(arLocations).city_name,
      description: `${name} es una empresa líder en instalaciones gráficas profesionales con presencia en Argentina.`,
      tax_id: `30-${randomInt(10000000, 99999999)}-${randomInt(0, 9)}`,
      status: companyStatus,
      verified_at: companyStatus === 'verified' ? new Date().toISOString() : null,
    }, { onConflict: 'profile_id' }).select('id').single()

    if (company) {
      companyIds.push({ userId, companyId: company.id })
    }
  }

  console.log(`  📊 ${companyIds.length} empresas creadas`)

  // --- Crear 50 Instaladores ---
  console.log('\n🔧 Creando 50 instaladores...')
  const installerIds = [] // { userId, installerId }

  for (let i = 0; i < INSTALLER_NAMES.length; i++) {
    const name = INSTALLER_NAMES[i]
    const email = `instalador${i + 1}@test.com`

    const userId = await createUser(email, name, 'installer')
    if (!userId) continue

    // Crear perfil
    await supabase.from('profiles').upsert({
      id: userId,
      email,
      full_name: name,
      role: 'installer',
      country_code: 'AR',
      status: 'active',
      phone: `+5411${randomInt(50000000, 59999999)}`,
    }, { onConflict: 'id' })

    // Crear instalador
    const statusOptions = ['approved', 'approved', 'approved', 'approved', 'pending_review', 'draft']
    const status = i < 40 ? 'approved' : randomItem(statusOptions)
    const years = randomInt(1, 15)
    const bios = [
      `Instalador profesional con ${years} años de experiencia en vinilos y señalética.`,
      `Especialista en rotulación comercial e industrial. Trabajo en CABA y GBA.`,
      `Técnico certificado en instalaciones gráficas de gran formato.`,
      `Experiencia en ploteo vehicular, decoración de interiores y señalización.`,
      `Profesional dedicado a instalaciones de calidad. Puntualidad garantizada.`,
    ]

    const { data: installer } = await supabase.from('installers').upsert({
      profile_id: userId,
      country: 'AR',
      status,
      years_of_experience: years,
      bio: randomItem(bios),
      avg_rating: status === 'approved' ? (3.5 + Math.random() * 1.5) : 0,
      total_reviews: status === 'approved' ? randomInt(0, 25) : 0,
      is_verified: status === 'approved',
      approved_at: status === 'approved' ? new Date().toISOString() : null,
      coverage_zones: [randomItem(arLocations).city_name, randomItem(arLocations).city_name],
    }, { onConflict: 'profile_id' }).select('id').single()

    if (installer) {
      installerIds.push({ userId, installerId: installer.id })

      // Skills para instaladores aprobados
      if (status === 'approved') {
        const allSkills = ['Ploteo de vinilos', 'Señalética', 'Rotulación', 'Lonas y banners',
          'Letras 3D', 'Ploteo vehicular', 'Vinilo esmerilado', 'Cartelería', 'Impresión gran formato',
          'Cristalería', 'Decoración de interiores', 'Señalización vial']
        const numSkills = randomInt(2, 5)
        const selectedSkills = allSkills.sort(() => Math.random() - 0.5).slice(0, numSkills)

        for (const skill of selectedSkills) {
          await supabase.from('installer_skills').insert({
            installer_id: installer.id,
            skill_name: skill,
            proficiency_level: randomItem(['beginner', 'intermediate', 'advanced', 'expert']),
            years_of_experience: randomInt(1, years),
          })
        }
      }
    }
  }

  console.log(`  📊 ${installerIds.length} instaladores creados`)

  // --- Crear 30 Trabajos ---
  console.log('\n📝 Creando 30 trabajos...')
  const jobIds = []
  const verifiedCompanies = companyIds.slice(0, 20)

  for (let i = 0; i < JOB_TITLES.length; i++) {
    const company = verifiedCompanies[i % verifiedCompanies.length]
    const category = randomItem(categories)
    const location = randomItem(arLocations)
    const budgetMin = randomInt(5, 50) * 10000 // 50k - 500k
    const budgetMax = budgetMin + randomInt(2, 10) * 10000

    // Distribuir estados realistas
    let status, publishedAt, adminApprovedAt
    if (i < 5) {
      status = 'published'
      publishedAt = randomDate(30)
      adminApprovedAt = publishedAt
    } else if (i < 10) {
      status = 'receiving_offers'
      publishedAt = randomDate(20)
      adminApprovedAt = publishedAt
    } else if (i < 14) {
      status = 'offer_accepted'
      publishedAt = randomDate(40)
      adminApprovedAt = publishedAt
    } else if (i < 17) {
      status = 'in_progress'
      publishedAt = randomDate(50)
      adminApprovedAt = publishedAt
    } else if (i < 20) {
      status = 'completed_by_installer'
      publishedAt = randomDate(60)
      adminApprovedAt = publishedAt
    } else if (i < 23) {
      status = 'approved'
      publishedAt = randomDate(90)
      adminApprovedAt = publishedAt
    } else if (i < 25) {
      status = 'rated'
      publishedAt = randomDate(120)
      adminApprovedAt = publishedAt
    } else if (i < 27) {
      status = 'pending_admin_approval'
      publishedAt = null
      adminApprovedAt = null
    } else {
      status = 'draft'
      publishedAt = null
      adminApprovedAt = null
    }

    const { data: job } = await supabase.from('jobs').insert({
      company_id: company.companyId,
      category_id: category.id,
      title: JOB_TITLES[i],
      description: randomItem(JOB_DESCRIPTIONS),
      location_id: location.id,
      status,
      budget_min: budgetMin,
      budget_max: budgetMax,
      currency: 'ARS',
      start_date: new Date(Date.now() + randomInt(7, 60) * 86400000).toISOString(),
      end_date: new Date(Date.now() + randomInt(61, 120) * 86400000).toISOString(),
      admin_approved_at: adminApprovedAt,
      published_at: publishedAt,
    }).select('id, status, company_id').single()

    if (job) {
      jobIds.push(job)
      console.log(`  ✅ Trabajo #${i + 1}: "${JOB_TITLES[i].substring(0, 40)}..." → ${status}`)
    }
  }

  // --- Crear Ofertas ---
  console.log('\n💰 Creando ofertas...')
  const approvedInstallers = installerIds.filter((_, idx) => idx < 40)
  let offerCount = 0
  const agreements = []

  // Ofertas para trabajos que están receiving_offers o más avanzados
  const jobsWithOffers = jobIds.filter(j =>
    !['draft', 'pending_admin_approval', 'published'].includes(j.status)
  )

  for (const job of jobsWithOffers) {
    const numOffers = randomInt(2, 5)
    const shuffledInstallers = [...approvedInstallers].sort(() => Math.random() - 0.5)
    let acceptedOffer = null

    for (let k = 0; k < numOffers && k < shuffledInstallers.length; k++) {
      const inst = shuffledInstallers[k]
      const isAccepted = k === 0 && ['offer_accepted', 'in_progress', 'completed_by_installer', 'approved', 'rated'].includes(job.status)

      const offerStatus = isAccepted ? 'accepted' :
                          (k === 0 ? 'sent' : randomItem(['sent', 'shortlisted', 'rejected', 'withdrawn']))

      const { data: offer } = await supabase.from('offers').insert({
        job_id: job.id,
        installer_id: inst.installerId,
        status: offerStatus,
        proposed_price: randomInt(5, 50) * 10000,
        currency: 'ARS',
        availability_start_date: new Date(Date.now() + randomInt(7, 30) * 86400000).toISOString(),
        estimated_duration: randomItem(['3 días', '1 semana', '2 semanas', '1 mes']),
        team_size: randomInt(1, 4),
        message: randomItem([
          'Tengo amplia experiencia en este tipo de trabajos. Puedo comenzar la semana que viene.',
          'Trabajo garantizado con materiales de primera calidad. Consulte sin compromiso.',
          'Equipo profesional disponible. Incluye limpieza final del área de trabajo.',
          'Presupuesto competitivo con materiales premium. Referencias disponibles.',
          'Experiencia en proyectos similares. Entrega puntual garantizada.',
        ]),
        submitted_at: randomDate(15),
        accepted_at: isAccepted ? randomDate(10) : null,
      }).select('id').single()

      if (offer) {
        offerCount++
        if (isAccepted) {
          acceptedOffer = { offerId: offer.id, installer: inst }
        }
      }
    }

    // Crear acuerdo para ofertas aceptadas
    if (acceptedOffer && ['offer_accepted', 'in_progress', 'completed_by_installer', 'approved', 'rated'].includes(job.status)) {
      let agreementStatus = 'active'
      if (job.status === 'in_progress') agreementStatus = 'in_progress'
      if (job.status === 'completed_by_installer') agreementStatus = 'completed'
      if (job.status === 'approved' || job.status === 'rated') agreementStatus = 'completed'

      const { data: agreement } = await supabase.from('agreements').insert({
        job_id: job.id,
        offer_id: acceptedOffer.offerId,
        company_id: job.company_id,
        installer_id: acceptedOffer.installer.installerId,
        status: agreementStatus,
        final_price: randomInt(5, 50) * 10000,
        currency: 'ARS',
        confirmed_start_date: new Date(Date.now() + randomInt(-30, 30) * 86400000).toISOString(),
        confirmed_end_date: new Date(Date.now() + randomInt(31, 90) * 86400000).toISOString(),
        notes: randomItem([
          'Coordinar acceso al edificio con seguridad',
          'Trabajo fuera de horario comercial',
          'Incluye materiales premium',
          'Requiere andamio para altura',
          null,
        ]),
      }).select('id, job_id, company_id, installer_id, status').single()

      if (agreement) {
        agreements.push(agreement)
      }
    }
  }

  console.log(`  📊 ${offerCount} ofertas creadas`)
  console.log(`  📊 ${agreements.length} acuerdos creados`)

  // --- Crear Reseñas para trabajos rated ---
  console.log('\n⭐ Creando reseñas...')
  let reviewCount = 0

  const completedAgreements = agreements.filter(a => a.status === 'completed')

  for (const agreement of completedAgreements) {
    // Buscar los userIds
    const companyEntry = companyIds.find(c => c.companyId === agreement.company_id)
    const installerEntry = installerIds.find(i => i.installerId === agreement.installer_id)

    if (!companyEntry || !installerEntry) continue

    // Reseña de la empresa al instalador
    const { error: r1 } = await supabase.from('reviews').insert({
      job_id: agreement.job_id,
      agreement_id: agreement.id,
      reviewer_id: companyEntry.userId,
      reviewed_id: installerEntry.userId,
      rating: randomInt(3, 5),
      comment: randomItem([
        'Excelente trabajo, muy profesional y puntual.',
        'Buen trabajo en general, cumplió con los plazos.',
        'Muy conforme con el resultado. Lo recomiendo.',
        'Trabajo impecable, superó nuestras expectativas.',
        'Profesional serio y responsable. Volveríamos a contratarlo.',
      ]),
    })
    if (!r1) reviewCount++

    // Reseña del instalador a la empresa
    const { error: r2 } = await supabase.from('reviews').insert({
      job_id: agreement.job_id,
      agreement_id: agreement.id,
      reviewer_id: installerEntry.userId,
      reviewed_id: companyEntry.userId,
      rating: randomInt(3, 5),
      comment: randomItem([
        'Empresa seria, paga en tiempo y forma.',
        'Buena comunicación durante todo el proyecto.',
        'Muy organizados, facilitan el acceso al lugar de trabajo.',
        'Excelente trato, volvería a trabajar con ellos.',
        'Todo en orden, recomiendo trabajar con esta empresa.',
      ]),
    })
    if (!r2) reviewCount++
  }

  console.log(`  📊 ${reviewCount} reseñas creadas`)

  // --- Crear Notificaciones ---
  console.log('\n🔔 Creando notificaciones...')
  let notifCount = 0

  for (const company of companyIds.slice(0, 10)) {
    const notifs = [
      { type: 'offer_received', title: 'Nueva oferta recibida', message: 'Un instalador envió una oferta para tu trabajo.' },
      { type: 'agreement_update', title: 'Acuerdo actualizado', message: 'El estado de tu acuerdo cambió.' },
      { type: 'system', title: 'Bienvenido a Se Instala Pro', message: 'Tu cuenta de empresa fue verificada.' },
    ]
    for (const n of notifs) {
      await supabase.from('notifications').insert({
        user_id: company.userId,
        notification_type: n.type,
        title: n.title,
        message: n.message,
        is_read: Math.random() > 0.5,
      })
      notifCount++
    }
  }

  for (const inst of installerIds.slice(0, 15)) {
    const notifs = [
      { type: 'job_approved', title: 'Nuevo trabajo disponible', message: 'Se publicó un trabajo que coincide con tu perfil.' },
      { type: 'offer_accepted', title: '¡Tu oferta fue aceptada!', message: 'Una empresa aceptó tu oferta.' },
      { type: 'review_received', title: 'Nueva reseña', message: 'Recibiste una nueva calificación.' },
    ]
    for (const n of notifs) {
      await supabase.from('notifications').insert({
        user_id: inst.userId,
        notification_type: n.type,
        title: n.title,
        message: n.message,
        is_read: Math.random() > 0.3,
      })
      notifCount++
    }
  }

  console.log(`  📊 ${notifCount} notificaciones creadas`)

  // --- Crear Disputas ---
  console.log('\n⚠️ Creando disputas...')
  const disputeAgreements = agreements.slice(0, 3)
  let disputeCount = 0

  for (const agr of disputeAgreements) {
    const companyEntry = companyIds.find(c => c.companyId === agr.company_id)
    if (!companyEntry) continue

    await supabase.from('disputes').insert({
      job_id: agr.job_id,
      agreement_id: agr.id,
      reporter_id: companyEntry.userId,
      status: randomItem(['new', 'under_review', 'resolved']),
      title: randomItem([
        'Instalación no cumple con lo acordado',
        'Retraso excesivo en la entrega',
        'Material de baja calidad utilizado',
      ]),
      description: 'Se detectaron diferencias entre lo acordado y lo entregado. Se solicita revisión del caso.',
      resolution: Math.random() > 0.5 ? 'Se acordó una compensación parcial y corrección del trabajo.' : null,
    })
    disputeCount++
  }

  console.log(`  📊 ${disputeCount} disputas creadas`)

  // --- Resumen ---
  console.log('\n' + '='.repeat(50))
  console.log('✅ SEED COMPLETADO')
  console.log('='.repeat(50))
  console.log(`
📊 RESUMEN:
  👑 1 admin (nicolas.galarza87@gmail.com)
  🏢 ${companyIds.length} empresas (${companyIds.length > 20 ? 20 : companyIds.length} verificadas)
  🔧 ${installerIds.length} instaladores (40 aprobados)
  📝 ${jobIds.length} trabajos (varios estados)
  💰 ${offerCount} ofertas
  🤝 ${agreements.length} acuerdos
  ⭐ ${reviewCount} reseñas
  🔔 ${notifCount} notificaciones
  ⚠️  ${disputeCount} disputas

🔑 CREDENCIALES:
  Admin: nicolas.galarza87@gmail.com
  Empresas: empresa1@test.com a empresa25@test.com
  Instaladores: instalador1@test.com a instalador50@test.com
  Contraseña de todos: ${PASSWORD}
  `)
}

main().catch(console.error)
