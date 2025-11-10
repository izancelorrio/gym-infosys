// Determine API URL based on environment
const getApiBaseUrl = () => {
  // Check for explicit environment variable
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Check if we're running in a Docker environment
  if (process.env.NEXT_PUBLIC_DOCKER === 'true') {
    return 'http://api:8000';  // Docker service name
  }

  // Development fallback
  return 'http://localhost:8000';  // Local development IP
};

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

export const USUARIOS_DEMO = [
  {
    id: 1,
    email: "usuario@email.com",
    name: "Usuario",
    role: "usuario",
    password: "123456",
  },
  {
    id: 2,
    email: "cliente@email.com",
    name: "Cliente",
    role: "cliente",
    password: "123456",
  },
  {
    id: 3,
    email: "clientepro@email.com",
    name: "ClientePro",
    role: "clientepro",
    password: "123456",
    entrenadorAsignado: "Carlos Ruiz",
  },
  {
    id: 4,
    email: "admin@email.com",
    name: "Admin",
    role: "admin",
    password: "123456",
  },
  {
    id: 5,
    email: "entrenador@email.com",
    name: "Entrenador",
    role: "entrenador",
    password: "123456",
  },
] as const
