'use client'

import { useEffect } from 'react'

// Registra el service worker para que la app sea instalable como PWA
export function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // sin SW la app sigue funcionando, solo pierde la instalación PWA
      })
    }
  }, [])

  return null
}
