'use client'

import { useEffect, useState } from 'react'
import { Search, Filter, Briefcase } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { SkeletonCardList } from '@/components/ui/Skeleton'
import { JobSearchCard } from '@/components/instalador/JobSearchCard'
import { getPublishedJobs } from '@/lib/actions/offers'
import { getCategories } from '@/lib/actions/jobs'
import type { Job, Company, Category, Location, Profile } from '@/types/database'

type JobResult = Job & {
  company?: Company & { profile?: Pick<Profile, 'full_name'> }
  category?: Category
  location?: Location
}

export default function InstaladorTrabajosPage() {
  const [jobs, setJobs] = useState<JobResult[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    async function loadCategories() {
      const cats = await getCategories()
      setCategories(cats)
    }
    loadCategories()
  }, [])

  useEffect(() => {
    async function loadJobs() {
      setIsLoading(true)
      try {
        const data = await getPublishedJobs({
          category_id: selectedCategory || undefined,
          search: searchTerm || undefined,
        })
        setJobs(data)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    const debounce = setTimeout(loadJobs, 300)
    return () => clearTimeout(debounce)
  }, [searchTerm, selectedCategory])

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Buscar Trabajos"
        description="Encontrá trabajos de instalación gráfica disponibles"
      />

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Buscar por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="relative">
          <Filter
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white"
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resultados */}
      {isLoading ? (
        <SkeletonCardList count={4} />
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="font-semibold text-gray-900 mb-1">
            No hay trabajos disponibles
          </h3>
          <p className="text-sm text-gray-500">
            {searchTerm || selectedCategory
              ? 'Probá cambiando los filtros de búsqueda.'
              : 'Todavía no hay trabajos publicados. Volvé pronto.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 mb-2">
            {jobs.length} {jobs.length === 1 ? 'trabajo disponible' : 'trabajos disponibles'}
          </p>
          {jobs.map((job) => (
            <JobSearchCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  )
}
