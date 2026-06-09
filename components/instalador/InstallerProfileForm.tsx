'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { InstallerStatusBadge } from '@/components/admin/InstallerStatusBadge'
import {
  installerProfileSchema,
  type InstallerProfileInput,
} from '@/lib/validations/installer'
import {
  getInstallerProfile,
  updateInstallerProfile,
  getInstallerSkills,
  addInstallerSkill,
  removeInstallerSkill,
} from '@/lib/actions/installer'
import { X, Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { Installer, Profile, InstallerStatus } from '@/types/database'

const SKILL_SUGGESTIONS = [
  'Vinilos decorativos',
  'Vinilos vehiculares',
  'Señalética corporativa',
  'Rótulos luminosos',
  'Rótulos no luminosos',
  'Lonas publicitarias',
  'Banners',
  'Letras 3D',
  'Ploteo de vidrios',
  'Micro perforado',
  'Empapelado',
  'Calcos / stickers',
  'Instalación en altura',
  'Publicidad exterior',
]

export function InstallerProfileForm() {
  const [installer, setInstaller] = useState<
    (Installer & { profile?: Profile }) | null
  >(null)
  const [skills, setSkills] = useState<
    Array<{ id: string; skill_name: string }>
  >([])
  const [newSkill, setNewSkill] = useState('')
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [result, setResult] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InstallerProfileInput>({
    resolver: zodResolver(installerProfileSchema),
  })

  useEffect(() => {
    async function load() {
      try {
        const [profileData, skillsData] = await Promise.all([
          getInstallerProfile(),
          getInstallerSkills(),
        ])
        setInstaller(profileData)
        setSkills(skillsData)
        if (profileData) {
          reset({
            bio: profileData.bio || '',
            years_of_experience: profileData.years_of_experience || undefined,
            portfolio_url: profileData.portfolio_url || '',
            phone: profileData.profile?.phone || '',
            country: profileData.country || 'AR',
            city: '',
            coverage_zones: profileData.coverage_zones || [],
          })
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoadingProfile(false)
      }
    }
    load()
  }, [reset])

  const onSubmit = async (data: InstallerProfileInput) => {
    setResult(null)
    const res = await updateInstallerProfile(data)
    if (res.success) {
      setResult({ type: 'success', message: res.message || 'Perfil actualizado' })
      toast.success('Perfil actualizado')
    } else {
      setResult({ type: 'error', message: res.error || 'Error desconocido' })
    }
  }

  const handleAddSkill = async (skillName: string) => {
    if (!skillName.trim()) return
    const res = await addInstallerSkill(skillName.trim())
    if (res.success) {
      const updatedSkills = await getInstallerSkills()
      setSkills(updatedSkills)
      setNewSkill('')
      toast.success('Habilidad agregada')
    } else {
      toast.error(res.error || 'Error')
    }
  }

  const handleRemoveSkill = async (skillId: string) => {
    const res = await removeInstallerSkill(skillId)
    if (res.success) {
      setSkills((prev) => prev.filter((s) => s.id !== skillId))
      toast.success('Habilidad eliminada')
    }
  }

  if (isLoadingProfile) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estado del perfil */}
      {installer && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Estado de tu perfil</p>
            <div className="mt-1">
              <InstallerStatusBadge status={installer.status} />
            </div>
          </div>
          {installer.rejected_reason && (
            <div className="text-right max-w-sm">
              <p className="text-xs text-red-600">
                Motivo: {installer.rejected_reason}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Formulario de perfil */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Datos del perfil
        </h3>

        {result && (
          <div className="mb-4">
            <Alert
              variant={result.type}
              onClose={() => setResult(null)}
            >
              {result.message}
            </Alert>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción profesional *
            </label>
            <textarea
              {...register('bio')}
              rows={4}
              placeholder="Contá tu experiencia en instalaciones gráficas, tipos de trabajos que realizás, herramientas que usás..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.bio && (
              <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Años de experiencia"
              type="number"
              {...register('years_of_experience', { valueAsNumber: true })}
              error={errors.years_of_experience?.message}
              placeholder="ej: 5"
            />
            <Input
              label="Teléfono"
              {...register('phone')}
              placeholder="+54 11 5555-1234"
            />
          </div>

          <Input
            label="URL de portfolio"
            {...register('portfolio_url')}
            error={errors.portfolio_url?.message}
            placeholder="https://miportfolio.com"
            helperText="Tu portfolio, Instagram, o sitio web con trabajos realizados"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                País *
              </label>
              <select
                {...register('country')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="AR">Argentina</option>
                <option value="BR">Brasil</option>
              </select>
              {errors.country && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.country.message}
                </p>
              )}
            </div>
            <Input
              label="Ciudad"
              {...register('city')}
              placeholder="ej: Buenos Aires"
            />
          </div>

          <Button type="submit" isLoading={isSubmitting}>
            Guardar perfil
          </Button>
        </div>
      </form>

      {/* Habilidades */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Habilidades
        </h3>

        {/* Skills existentes */}
        <div className="flex flex-wrap gap-2 mb-4">
          {skills.length === 0 ? (
            <p className="text-sm text-gray-500">
              Todavía no agregaste habilidades. Agregá las que mejor te representan.
            </p>
          ) : (
            skills.map((skill) => (
              <span
                key={skill.id}
                className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
              >
                {skill.skill_name}
                <button
                  onClick={() => handleRemoveSkill(skill.id)}
                  className="text-primary-400 hover:text-primary-700"
                >
                  <X size={14} />
                </button>
              </span>
            ))
          )}
        </div>

        {/* Agregar skill */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Escribí una habilidad..."
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddSkill(newSkill)
              }
            }}
          />
          <Button
            type="button"
            size="sm"
            onClick={() => handleAddSkill(newSkill)}
            disabled={!newSkill.trim()}
          >
            <Plus size={16} className="mr-1" />
            Agregar
          </Button>
        </div>

        {/* Sugerencias */}
        <div>
          <p className="text-xs text-gray-500 mb-2">Sugerencias:</p>
          <div className="flex flex-wrap gap-1">
            {SKILL_SUGGESTIONS.filter(
              (s) => !skills.some((sk) => sk.skill_name === s)
            ).map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleAddSkill(suggestion)}
                className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-primary-50 hover:text-primary-700 transition-colors"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
