'use client'

import { clsx } from 'clsx'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null

  // Generar rango de páginas visibles
  const getVisiblePages = () => {
    const pages: (number | 'dots')[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible + 2) {
      // Mostrar todas
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)

      if (currentPage > 3) pages.push('dots')

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) pages.push(i)

      if (currentPage < totalPages - 2) pages.push('dots')

      pages.push(totalPages)
    }

    return pages
  }

  return (
    <nav
      className={clsx('flex items-center justify-center gap-1', className)}
      aria-label="Paginación"
    >
      {/* Anterior */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={clsx(
          'p-2 rounded-lg text-sm transition-colors',
          currentPage === 1
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
        )}
        aria-label="Página anterior"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Páginas */}
      {getVisiblePages().map((page, idx) =>
        page === 'dots' ? (
          <span key={`dots-${idx}`} className="px-2 text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={clsx(
              'min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors',
              currentPage === page
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            )}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        )
      )}

      {/* Siguiente */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={clsx(
          'p-2 rounded-lg text-sm transition-colors',
          currentPage === totalPages
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
        )}
        aria-label="Página siguiente"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  )
}
