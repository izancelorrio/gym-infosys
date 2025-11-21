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
    // Enforce fresh session on every new load: clear any persisted session data so
    // that opening the app in a new tab/window always starts as logged out.
    console.log("[GymInfoSys] AuthProvider mounting - clearing persisted session to enforce fresh login state")
    setIsHydrated(true)

    try {
      if (typeof window !== "undefined") {
        // Remove any previously saved client-side session
        localStorage.removeItem("gym_user")
        console.log("[GymInfoSys] Cleared localStorage 'gym_user' on mount")
      }

      // Also remove cookie backup if present
      deleteCookie("gym_user")

      // Ensure user is null on initial load
      setUser(null)
    } catch (error) {
      console.error("[GymInfoSys] Error while clearing persisted session:", error)
    } finally {
      setIsLoading(false)
      console.log("[GymInfoSys] AuthProvider initialization complete (persistent session cleared)")
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

