'use client'

// ============================================================
// AUTH PROVIDER - Contexto de autenticación client-side
// ============================================================

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile, UserRole } from '@/types/database'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  isLoading: boolean
  role: UserRole | null
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  role: null,
  refreshProfile: async () => {},
})

// Timeout máximo para inicialización de auth (ms)
const AUTH_INIT_TIMEOUT = 10_000

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Ref para evitar actualizaciones de estado después del unmount
  const mountedRef = useRef(true)
  // Ref para evitar doble fetchProfile por race condition
  // entre initAuth y onAuthStateChange INITIAL_SESSION
  const profileLoadedRef = useRef(false)

  const supabase = createClient()

  const fetchProfile = useCallback(
    async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) {
          console.error('Error fetching profile:', error.message)
        }

        if (mountedRef.current) {
          setProfile(data as Profile | null)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        if (mountedRef.current) {
          setProfile(null)
        }
      }
    },
    [supabase]
  )

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }, [user, fetchProfile])

  useEffect(() => {
    mountedRef.current = true
    profileLoadedRef.current = false

    // Safety timeout: si auth tarda más de AUTH_INIT_TIMEOUT, forzar carga
    const timeout = setTimeout(() => {
      if (mountedRef.current) {
        setIsLoading(false)
      }
    }, AUTH_INIT_TIMEOUT)

    // Obtener sesión inicial
    const initAuth = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession()

        if (!mountedRef.current) return

        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        if (currentSession?.user && !profileLoadedRef.current) {
          profileLoadedRef.current = true
          await fetchProfile(currentSession.user.id)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        if (mountedRef.current) {
          setIsLoading(false)
        }
      }
    }

    initAuth()

    // Escuchar cambios de auth (incluye INITIAL_SESSION en supabase-js v2.39+)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mountedRef.current) return

      try {
        setSession(newSession)
        setUser(newSession?.user ?? null)

        if (newSession?.user && !profileLoadedRef.current) {
          profileLoadedRef.current = true
          await fetchProfile(newSession.user.id)
        } else if (newSession?.user && event === 'TOKEN_REFRESHED') {
          // En refresh de token, actualizar perfil
          await fetchProfile(newSession.user.id)
        } else if (!newSession?.user) {
          setProfile(null)
        }
      } catch (error) {
        console.error('Error in auth state change:', error)
      } finally {
        if (mountedRef.current) {
          setIsLoading(false)
        }
      }
    })

    return () => {
      mountedRef.current = false
      profileLoadedRef.current = false
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [supabase, fetchProfile])

  const value: AuthContextType = {
    user,
    profile,
    session,
    isLoading,
    role: profile?.role ?? null,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}
