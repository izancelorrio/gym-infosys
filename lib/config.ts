export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000",
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
