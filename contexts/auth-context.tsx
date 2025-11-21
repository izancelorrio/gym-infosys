"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: number
  email: string
  name: string
  role: "usuario" | "cliente" | "entrenador" | "admin"
  verified?: boolean
  cliente?: {
    id: number
    dni: string
    numero_telefono: string
    plan_id: number
    fecha_nacimiento: string
    genero: string
    num_tarjeta: string
    fecha_tarjeta: string
    cvv: string
    fecha_inscripcion: string
    estado: string
  }
}

interface AuthContextType {
  user: User | null
  login: (userData: User) => void
  logout: () => void
  updateUser: (userData: User) => void
  isAuthenticated: boolean
  isLoading: boolean
  hasRole: (role: User["role"]) => boolean
  isClient: () => boolean
  isTrainer: () => boolean
  isAdmin: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return

  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
  console.log("[GymInfoSys] Cookie set:", name, value)
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null

  const nameEQ = name + "="
  const ca = document.cookie.split(";")
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === " ") c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) {
      const value = c.substring(nameEQ.length, c.length)
      console.log("[GymInfoSys] Cookie retrieved:", name, value)
      return value
    }
  }
  console.log("[GymInfoSys] Cookie not found:", name)
  return null
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return

  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
  console.log("[GymInfoSys] Cookie deleted:", name)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Decide whether to clear persisted session. We want to:
    // - Clear stored session when the user "enters" the app (fresh navigation)
    // - Preserve session when the page is reloaded (F5 / browser reload) or when
    //   navigating with back/forward, so the user doesn't get logged out on refresh.
    console.log("[GymInfoSys] AuthProvider mounting - determining navigation type to decide session handling")
    setIsHydrated(true)

    try {
      let navType: string | undefined = undefined

      if (typeof window !== "undefined" && typeof performance !== "undefined") {
        const entries = performance.getEntriesByType("navigation")
        if (entries && entries.length > 0) {
          // PerformanceNavigationTiming.type can be 'navigate' | 'reload' | 'back_forward' | 'prerender'
          // @ts-ignore
          navType = (entries[0] as PerformanceNavigationTiming).type
        } else if ((performance as any).navigation && typeof (performance as any).navigation.type === "number") {
          // Fallback for older browsers: performance.navigation.type
          const t = (performance as any).navigation.type
          // 0 = navigate, 1 = reload, 2 = back_forward
          navType = t === 1 ? "reload" : t === 2 ? "back_forward" : "navigate"
        }
      }

      console.log("[GymInfoSys] navigation type:", navType)

      // If this is a reload or back/forward navigation, preserve any existing session
      if (navType === "reload" || navType === "back_forward") {
        console.log("[GymInfoSys] Detected reload/back navigation - preserving session if present")
        if (typeof window !== "undefined") {
          const savedUser = localStorage.getItem("gym_user")
          if (savedUser && savedUser !== "null") {
            try {
              const userData: User = JSON.parse(savedUser)
              setUser(userData)
              console.log("[GymInfoSys] Restored user from localStorage on reload/back navigation", userData)
            } catch (e) {
              console.error("[GymInfoSys] Failed parsing saved user on reload/back navigation:", e)
              localStorage.removeItem("gym_user")
              deleteCookie("gym_user")
            }
          } else {
            console.log("[GymInfoSys] No saved user found in localStorage on reload/back navigation")
          }
        }

        setIsLoading(false)
        return
      }

      // Otherwise (fresh navigation), clear any previous persisted session to
      // ensure the app opens unauthenticated.
      if (typeof window !== "undefined") {
        localStorage.removeItem("gym_user")
        console.log("[GymInfoSys] Cleared localStorage 'gym_user' on fresh navigation mount")
      }
      deleteCookie("gym_user")
      setUser(null)
    } catch (error) {
      console.error("[GymInfoSys] Error while handling persisted session:", error)
    } finally {
      setIsLoading(false)
      console.log("[GymInfoSys] AuthProvider initialization complete (navigation-aware)")
    }
  }, [])

  const login = (userData: User) => {
    console.log("[GymInfoSys] Login called with:", userData)
    const userWithRole = {
      ...userData,
      role: userData.role || ("usuario" as User["role"]),
    }
    setUser(userWithRole)

    if (typeof window !== "undefined") {
      const userString = JSON.stringify(userWithRole)

      // Guardar en localStorage
      localStorage.setItem("gym_user", userString)
      console.log("[GymInfoSys] User saved to localStorage:", userWithRole)

      // Guardar en cookies como respaldo
      setCookie("gym_user", encodeURIComponent(userString), 7)

      // Verificar que se guardÃ³ correctamente
      const verification = localStorage.getItem("gym_user")
      const cookieVerification = getCookie("gym_user")
      console.log("[GymInfoSys] Storage verification - localStorage:", verification)
      console.log("[GymInfoSys] Storage verification - cookie:", cookieVerification)

      if (userWithRole.role === "entrenador") {
        console.log("[GymInfoSys] Redirecting trainer to /entrenador")
        setTimeout(() => {
          router.push("/entrenador")
        }, 100)
      } else if (userWithRole.role === "admin") {
        console.log("[GymInfoSys] Redirecting admin to /admin")
        setTimeout(() => {
          router.push("/admin")
        }, 100)
      }
    }
  }

  const logout = () => {
    console.log("[GymInfoSys] Logout called")
    setUser(null)

    if (typeof window !== "undefined") {
      localStorage.removeItem("gym_user")
      console.log("[GymInfoSys] User removed from localStorage")
    }

    deleteCookie("gym_user")
  }

  const updateUser = (userData: User) => {
    console.log("[GymInfoSys] UpdateUser called with:", userData)
    const userWithRole = {
      ...userData,
      role: userData.role || ("usuario" as User["role"]),
    }
    setUser(userWithRole)

    if (typeof window !== "undefined") {
      const userString = JSON.stringify(userWithRole)

      // Actualizar en localStorage
      localStorage.setItem("gym_user", userString)
      console.log("[GymInfoSys] User updated in localStorage:", userWithRole)

      // Actualizar en cookies como respaldo
      setCookie("gym_user", encodeURIComponent(userString), 7)
    }
  }

  const hasRole = (role: User["role"]) => {
    return user?.role === role
  }

  const isClient = () => {
    return user?.role === "cliente"
  }

  const isTrainer = () => {
    return user?.role === "entrenador"
  }

  const isAdmin = () => {
    return user?.role === "admin"
  }

  const isAuthenticated = !!user

  if (!isHydrated || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        isAuthenticated,
        isLoading,
        hasRole,
        isClient,
        isTrainer,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

