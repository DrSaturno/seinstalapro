'use client'

import { useState, useEffect, useRef, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Upload, X, FileText } from 'lucide-react'
import { createJobSchema, type CreateJobInput } from '@/lib/validations/job'
import { createJob, getCategories, getLocations, uploadJobFiles } from '@/lib/actions/jobs'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import type { Category, Location } from '@/types/database'

const URGENCY_OPTIONS = [
  { value: 'low', label: 'Baja - Sin apuro', color: 'text-gray-600' },
  { value: 'normal', label: 'Normal - Fecha flexible', color: 'text-blue-600' },
  { value: 'high', label: 'Alta - Lo antes posible', color: 'text-orange-600' },
  { value: 'urgent', label: 'Urgente - Inmediato', color: 'text-red-600' },
]

const CURRENCIES = [
  { code: 'ARS', label: 'Pesos Argentinos (ARS)' },
  { code: 'BRL', label: 'Reais (BRL)' },
  { code: 'USD', label: 'Dolares (USD)' },
]

const MAX_FILES = 10
const MAX_SIZE_MB = 5
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

interface FilePreview {
  file: File
  url: string
  isImage: boolean
}

export function JobForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([])
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateJobInput>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      is_height_work: false,
      requires_special_tools: false,
      urgency: 'normal',
    },
  })

  const isHeightWork = watch('is_height_work')
  const requiresSpecialTools = watch('requires_special_tools')

  // Cargar categorias y ubicaciones
  useEffect(() => {
    async function loadData() {
      try {
        const [cats, locs] = await Promise.all([
          getCategories(),
          getLocations(),
        ])
        setCategories(cats)
        setLocations(locs)
      } catch (err) {
        console.error('Error cargando datos:', err)
      } finally {
        setLoadingData(false)
      }
    }
    loadData()
  }, [])

  const handleFilesSelected = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const files = Array.from(e.target.files || [])

    if (filePreviews.length + files.length > MAX_FILES) {
      setError(`Maximo ${MAX_FILES} archivos por trabajo`)
      return
    }

    const newPreviews: FilePreview[] = []
    for (const file of files) {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`${file.name} excede ${MAX_SIZE_MB}MB`)
        return
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`${file.name}: solo se permiten JPG, PNG, WebP o PDF`)
        return
      }
      const isImage = file.type.startsWith('image/')
      newPreviews.push({
        file,
        url: isImage ? URL.createObjectURL(file) : '',
        isImage,
      })
    }

    setFilePreviews((prev) => [...prev, ...newPreviews])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeFile = (index: number) => {
    setFilePreviews((prev) => {
      const removed = prev[index]
      if (removed.url) URL.revokeObjectURL(removed.url)
      return prev.filter((_, i) => i !== index)
    })
  }

  const onSubmit = async (data: CreateJobInput) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await createJob(data)
      if (result.success && result.jobId) {
        // Subir imagenes seleccionadas (si hay)
        if (filePreviews.length > 0) {
          setUploadStatus(`Subiendo ${filePreviews.length} archivo(s)...`)
          const formData = new FormData()
          filePreviews.forEach((p) => formData.append('files', p.file))
          const uploadResult = await uploadJobFiles(result.jobId, formData)
          if (!uploadResult.success) {
            // El trabajo ya se creo; avisamos pero seguimos al detalle
            console.error('Error subiendo archivos:', uploadResult.error)
          }
          filePreviews.forEach((p) => {
            if (p.url) URL.revokeObjectURL(p.url)
          })
        }
        router.push(`/empresa/trabajos/${result.jobId}`)
      } else {
        setError(result.error || 'Error al crear el trabajo')
        setIsLoading(false)
      }
    } catch (err) {
      setError('Error inesperado. Intenta de nuevo.')
      setIsLoading(false)
    } finally {
      setUploadStatus(null)
    }
  }

  // Agrupar ubicaciones por pais
  const locationsByCountry = locations.reduce<Record<string, Location[]>>(
    (acc, loc) => {
      const key = loc.country_name
      if (!acc[key]) acc[key] = []
      acc[key].push(loc)
      return acc
    },
    {}
  )

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner border-primary-500" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* ═══════════ SECCION 1: INFORMACION BASICA ═══════════ */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Informacion basica
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Datos principales del trabajo de instalacion
        </p>

        <div className="space-y-4">
          {/* Titulo */}
          <Input
            label="Titulo del trabajo *"
            placeholder="Ej: Instalacion de vinilos en local comercial 50m2"
            error={errors.title?.message}
            {...register('title')}
          />

          {/* Categoria */}
          <div>
            <label
              htmlFor="category_id"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Categoria *
            </label>
            <select
              id="category_id"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                errors.category_id
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-primary-500'
              }`}
              {...register('category_id')}
            >
              <option value="">Selecciona una categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                  {cat.description ? ` - ${cat.description}` : ''}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="mt-1 text-sm text-red-600">{errors.category_id.message}</p>
            )}
          </div>

          {/* Descripcion */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Descripcion detallada del trabajo *
            </label>
            <textarea
              id="description"
              rows={5}
              placeholder="Describi con detalle que trabajo necesitas: que hay que instalar, en que tipo de superficie, dimensiones, estado actual del lugar, cualquier detalle relevante para que el instalador pueda cotizar correctamente..."
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                errors.description
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-primary-500'
              }`}
              {...register('description')}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Urgencia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Urgencia
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              {...register('urgency')}
            >
              {URGENCY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Presupuesto estimado */}
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">
              Presupuesto estimado (opcional)
            </p>
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Minimo"
                type="number"
                placeholder="0"
                error={errors.budget_min?.message}
                {...register('budget_min', {
                  setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
                })}
              />
              <Input
                label="Maximo"
                type="number"
                placeholder="0"
                error={errors.budget_max?.message}
                {...register('budget_max', {
                  setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
                })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Moneda
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  {...register('currency')}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Ayuda a los instaladores a cotizar acorde a tu expectativa
            </p>
          </div>
        </div>
      </section>

      <hr className="border-gray-200" />

      {/* ═══════════ SECCION 2: UBICACION ═══════════ */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Ubicacion
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Donde se realizara la instalacion
        </p>

        <div className="space-y-4">
          {/* Ciudad/Region */}
          <div>
            <label
              htmlFor="location_id"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Ciudad / Region
            </label>
            <select
              id="location_id"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              {...register('location_id')}
            >
              <option value="">Selecciona la ciudad</option>
              {Object.entries(locationsByCountry).map(([country, locs]) => (
                <optgroup key={country} label={country}>
                  {locs.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.province_name
                        ? `${loc.city_name}, ${loc.province_name}`
                        : loc.city_name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Direccion exacta */}
          <Input
            label="Direccion exacta"
            placeholder="Ej: Av. Corrientes 1234, Piso 3, Local B"
            error={errors.address?.message}
            {...register('address')}
          />
        </div>
      </section>

      <hr className="border-gray-200" />

      {/* ═══════════ SECCION 3: ESPECIFICACIONES TECNICAS ═══════════ */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Especificaciones tecnicas
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Detalles importantes para que el instalador sepa que necesita
        </p>

        <div className="space-y-4">
          {/* Superficie */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Tipo de superficie"
              placeholder="Ej: Vidrio, pared lisa, pared rugosa, vehiculo..."
              error={errors.surface_type?.message}
              {...register('surface_type')}
            />
            <Input
              label="Dimensiones / Medidas"
              placeholder="Ej: 3m x 2m, 15m2 total"
              error={errors.surface_dimensions?.message}
              {...register('surface_dimensions')}
            />
          </div>

          {/* Trabajo en altura */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                {...register('is_height_work')}
              />
              <span className="text-sm font-medium text-gray-700">
                Es trabajo en altura (mas de 2 metros)
              </span>
            </label>

            {isHeightWork && (
              <div className="pl-7">
                <Input
                  label="Altura aproximada (metros)"
                  type="number"
                  placeholder="Ej: 4"
                  error={errors.height_meters?.message}
                  {...register('height_meters', { valueAsNumber: true })}
                />
                <p className="mt-1 text-xs text-amber-600">
                  El instalador necesitara equipamiento de seguridad apropiado
                </p>
              </div>
            )}
          </div>

          {/* Herramientas especiales */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                {...register('requires_special_tools')}
              />
              <span className="text-sm font-medium text-gray-700">
                Requiere herramientas o equipamiento especial
              </span>
            </label>

            {requiresSpecialTools && (
              <div className="pl-7">
                <textarea
                  rows={2}
                  placeholder="Ej: Andamio, escalera de mas de 6m, pistola de calor industrial, hidrogrua..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  {...register('special_tools_description')}
                />
                {errors.special_tools_description && (
                  <p className="mt-1 text-sm text-red-600">{errors.special_tools_description.message}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <hr className="border-gray-200" />

      {/* ═══════════ SECCION 4: LOGISTICA ═══════════ */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Logistica y acceso
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Informacion sobre horarios y acceso al lugar
        </p>

        <div className="space-y-4">
          {/* Horario especial */}
          <div>
            <label
              htmlFor="special_schedule"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Restricciones de horario
            </label>
            <textarea
              id="special_schedule"
              rows={2}
              placeholder="Ej: Solo se puede trabajar de 22:00 a 06:00 (local comercial), o solo fines de semana, o con cita previa..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              {...register('special_schedule')}
            />
            {errors.special_schedule && (
              <p className="mt-1 text-sm text-red-600">{errors.special_schedule.message}</p>
            )}
          </div>

          {/* Acceso */}
          <div>
            <label
              htmlFor="access_details"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Detalles de acceso
            </label>
            <textarea
              id="access_details"
              rows={2}
              placeholder="Ej: Estacionamiento disponible, ingreso por puerta lateral, pedir llave en porteria, necesita chaleco reflectivo..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              {...register('access_details')}
            />
            {errors.access_details && (
              <p className="mt-1 text-sm text-red-600">{errors.access_details.message}</p>
            )}
          </div>

          {/* Fechas */}
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">
              Fechas estimadas
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Fecha inicio"
                type="date"
                error={errors.start_date?.message}
                {...register('start_date')}
              />
              <Input
                label="Fecha fin"
                type="date"
                error={errors.end_date?.message}
                {...register('end_date')}
              />
            </div>
          </div>
        </div>
      </section>

      <hr className="border-gray-200" />

      {/* ═══════════ SECCION 5: NOTAS ADICIONALES ═══════════ */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Consideraciones adicionales
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Cualquier otro detalle que el instalador deba saber
        </p>

        <textarea
          rows={3}
          placeholder="Ej: El piso es fragil (proteger), hay alarma que se activa a las 23hs, el material ya esta comprado y lo entregamos nosotros, se necesita certificado de ART..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          {...register('additional_notes')}
        />
        {errors.additional_notes && (
          <p className="mt-1 text-sm text-red-600">{errors.additional_notes.message}</p>
        )}
      </section>

      <hr className="border-gray-200" />

      {/* ═══════════ SECCION 6: IMAGENES Y ARCHIVOS ═══════════ */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Imagenes y archivos
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Fotos del lugar, planos o disenos ayudan al instalador a cotizar mejor.
          JPG, PNG, WebP o PDF — max {MAX_SIZE_MB}MB cada uno, hasta {MAX_FILES} archivos.
        </p>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors border-gray-300 hover:border-primary-400 hover:bg-primary-50/50"
        >
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">
            Hace click para seleccionar archivos
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={handleFilesSelected}
            className="hidden"
          />
        </div>

        {filePreviews.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {filePreviews.map((preview, i) => (
              <div
                key={i}
                className="relative rounded-lg border border-gray-200 overflow-hidden aspect-square group"
              >
                {preview.isImage ? (
                  <img
                    src={preview.url}
                    alt={preview.file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 p-2">
                    <FileText className="h-6 w-6 text-gray-400 mb-1" />
                    <p className="text-xs text-gray-500 text-center truncate w-full">
                      {preview.file.name}
                    </p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(i)
                  }}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Eliminar archivo"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {uploadStatus && (
        <Alert variant="info">{uploadStatus}</Alert>
      )}

      {/* ═══════════ BOTONES ═══════════ */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        <Button type="submit" isLoading={isLoading} size="lg">
          Crear borrador
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
      </div>

      <p className="text-xs text-gray-500">
        * El trabajo se creara como borrador con tus imagenes incluidas. Despues podras revisarlo y enviarlo a revision para que sea publicado.
      </p>
    </form>
  )
}
