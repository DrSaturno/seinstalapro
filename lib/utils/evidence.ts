// ============================================================
// Validación de evidencia fotográfica de entrega
// La evidencia es OBLIGATORIA para marcar un trabajo como
// completado, y solo se aceptan imágenes (la empresa necesita
// ver el trabajo terminado, no documentos).
// ============================================================

export const MAX_EVIDENCE_FILES = 10
export const MAX_EVIDENCE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB
export const ALLOWED_EVIDENCE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export interface EvidenceFileLike {
  size: number
  type: string
  name: string
}

export interface EvidenceValidation {
  valid: boolean
  error?: string
}

export function validateEvidenceFiles(files: EvidenceFileLike[]): EvidenceValidation {
  if (files.length === 0) {
    return {
      valid: false,
      error: 'Tenés que subir al menos una foto del trabajo terminado',
    }
  }

  if (files.length > MAX_EVIDENCE_FILES) {
    return {
      valid: false,
      error: `Máximo ${MAX_EVIDENCE_FILES} fotos de evidencia`,
    }
  }

  for (const file of files) {
    if (file.size > MAX_EVIDENCE_SIZE_BYTES) {
      return {
        valid: false,
        error: `${file.name} excede el tamaño máximo de 5MB`,
      }
    }
    if (!ALLOWED_EVIDENCE_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `${file.name}: solo se aceptan fotos (JPG, PNG o WebP)`,
      }
    }
  }

  return { valid: true }
}
