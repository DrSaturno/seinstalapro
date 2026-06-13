'use client'

import { useEffect, useState } from 'react'
import { Star, MessageSquare, Briefcase } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { Avatar } from '@/components/ui/Avatar'
import { SkeletonCardList } from '@/components/ui/Skeleton'
import { getInstallerReviews } from '@/lib/actions/installer'
import { getInstallerStats } from '@/lib/actions/installer'
import { formatRelativeDate } from '@/lib/utils/format'

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          className={
            star <= rating
              ? 'text-yellow-500 fill-yellow-500'
              : 'text-gray-300'
          }
        />
      ))}
    </div>
  )
}

export default function InstaladorResenasPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [stats, setStats] = useState<{ avgRating: number; totalReviews: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [reviewsData, statsData] = await Promise.all([
          getInstallerReviews(),
          getInstallerStats(),
        ])
        setReviews(reviewsData)
        setStats({ avgRating: statsData.avgRating, totalReviews: statsData.totalReviews })
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader
        title="Reseñas"
        description="Calificaciones que recibiste de las empresas"
      />

      {/* Resumen de rating */}
      {stats && stats.totalReviews > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900">
                {stats.avgRating.toFixed(1)}
              </p>
              <StarRating rating={Math.round(stats.avgRating)} />
              <p className="text-sm text-gray-500 mt-1">
                {stats.totalReviews} reseña{stats.totalReviews !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter((r) => r.rating === star).length
                const pct = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-3">{star}</span>
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Lista de reseñas */}
      {isLoading ? (
        <SkeletonCardList count={3} />
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <EmptyState
            icon={Star}
            title="No tenés reseñas"
            description="Cuando completes tu primer trabajo, la empresa podrá dejarte una reseña que aparecerá acá."
          />
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const companyName =
              review.company?.company?.company_name ||
              review.reviewer?.full_name ||
              'Empresa'

            return (
              <div
                key={review.id}
                className="bg-white rounded-xl border border-gray-200 p-5"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      fallback={companyName}
                      src={review.reviewer?.avatar_url}
                      size="md"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{companyName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StarRating rating={review.rating} />
                        <span className="text-xs text-gray-400">
                          {formatRelativeDate(review.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {review.comment && (
                  <div className="flex gap-2 mb-3">
                    <MessageSquare size={14} className="text-gray-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {review.comment}
                    </p>
                  </div>
                )}

                {review.job && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Briefcase size={12} />
                    <span>{review.job.title}</span>
                    {review.job.category?.name && (
                      <span className="text-gray-400">· {review.job.category.name}</span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
