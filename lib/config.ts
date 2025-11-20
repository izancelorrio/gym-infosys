// Determine API URL based on environment
const getApiBaseUrl = () => {
  const isBrowser = typeof window !== "undefined"

  if (isBrowser) {
    if (process.env.NEXT_PUBLIC_BROWSER_API_URL) {
      return process.env.NEXT_PUBLIC_BROWSER_API_URL
    }

    const { protocol, hostname, port } = window.location
    const fallbackPort = process.env.NEXT_PUBLIC_API_FALLBACK_PORT || "8000"
    const needsPortSwap = port && ["3000", "4173"].includes(port)
    const resolvedPort = needsPortSwap ? fallbackPort : port
    const portSegment = resolvedPort ? `:${resolvedPort}` : ""

    return `${protocol}//${hostname}${portSegment}`
  }

  if (process.env.API_INTERNAL_URL) {
    return process.env.API_INTERNAL_URL
  }

  if (process.env.API_URL) {
    return process.env.API_URL
  }

  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }

  return "http://api:8000"
}

const BASE_URL = getApiBaseUrl().replace(/\/$/, '')

export const API_CONFIG = {
  BASE_URL,
  ENDPOINTS: {
    LOGIN: "/login",
    REGISTER: "/register",
    CHANGE_PASSWORD: "/change-password",
    COUNT_MEMBERS: "/count-members",
    HEALTH: "/health",
    VERIFY_EMAIL: "/verify-email",
    RESET_PASSWORD: "/reset-password",
    SEND_RESET_EMAIL: "/send-reset-email",
    PLANES: "/planes",
    COUNT_TRAINERS: "/count-trainers",
    CONTRACT_PLAN: "/contract-plan",
    ADMIN_USERS: "/admin/users",
    GYM_CLASSES: "/gym-clases",
    ENTRENADORES: "/entrenadores",
    CLASES_PROGRAMADAS: "/clases-programadas",
    RESERVAS: "/reservas",
  },
  HEADERS: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    "User-Agent": "FitGym-App/1.0",
  },
  TIMEOUT: 10000, // 10 segundos
} as const