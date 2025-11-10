"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Eye, EyeOff, Loader2, AlertCircle, Mail } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { API_CONFIG } from "@/lib/config"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToRegister: () => void
}

export function LoginModal({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [isResetLoading, setIsResetLoading] = useState(false)
  const [resetMessage, setResetMessage] = useState("")
  const [resetSent, setResetSent] = useState(false)

  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Check API health first
      const { checkApiHealth } = await import('@/lib/health-check')
      const isHealthy = await checkApiHealth()
      
      if (!isHealthy) {
        setError("No se puede conectar con el servidor. Por favor, intenta de nuevo más tarde.")
        setIsLoading(false)
        return
      }

      const proxyUrl = "/api/auth/login"
      console.log("[DEBUG] Making login request via Next proxy:", proxyUrl)
      console.log("[DEBUG] API_CONFIG:", API_CONFIG)
      const response = await fetch(proxyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      console.log("[DEBUG] Login response status:", response.status)
      const userData = await response.json()
      console.log("[DEBUG] Login response data:", userData)

      if (!response.ok) {
        setError(userData.error || "Error de autenticación")
        return
      }

      if (userData.user) {
        console.log("[DEBUG] Login successful, user data:", userData.user)
        login(userData.user)
        onClose()
        setEmail("")
        setPassword("")
        setError("")
      } else {
        setError("Datos de usuario no válidos")
      }
    } catch (error) {
      setError("Error de conexión. Por favor, intenta de nuevo.")
      console.error("Error en login:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsResetLoading(true)
    setResetMessage("")

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SEND_RESET_EMAIL}`, {
        method: "POST",
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify({ email: resetEmail }),
      })

      const result = await response.json()

      if (!response.ok) {
        setResetMessage(result.error || "Error al enviar email")
        return
      }

      setResetSent(true)
      setResetMessage(result.message || "Se ha enviado un enlace de restablecimiento a tu email")
    } catch (error) {
      setResetMessage("Error de conexión. Por favor, intenta de nuevo.")
      console.error("Error:", error)
    } finally {
      setIsResetLoading(false)
    }
  }

  const handleBackToLogin = () => {
    setShowForgotPassword(false)
    setResetEmail("")
    setResetMessage("")
    setResetSent(false)
  }

  const handleClose = () => {
    setShowForgotPassword(false)
    setResetEmail("")
    setResetMessage("")
    setResetSent(false)
    setError("")
    onClose()
  }

  if (resetSent) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold text-center">Email Enviado</DialogTitle>
            <DialogDescription className="text-center">Hemos enviado las instrucciones a tu email</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              <p className="text-sm">{resetMessage}</p>
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={handleBackToLogin} className="w-full">
                Volver al Login
              </Button>
              <Button variant="outline" onClick={handleClose} className="w-full bg-transparent">
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (showForgotPassword) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Restablecer Contraseña</DialogTitle>
            <DialogDescription className="text-center">
              Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleForgotPassword} className="space-y-4">
            {resetMessage && !resetSent && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4" />
                {resetMessage}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="resetEmail">Email</Label>
              <Input
                id="resetEmail"
                type="email"
                placeholder="tu@email.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isResetLoading}>
              {isResetLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Enlace de Reset"
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            <Button variant="link" className="p-0 h-auto font-semibold" onClick={handleBackToLogin}>
              Volver al Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Iniciar Sesión</DialogTitle>
          <DialogDescription className="text-center">
            Ingresa tus credenciales para acceder a tu cuenta
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="text-right">
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto text-sm font-normal text-gray-600 hover:text-gray-900"
              onClick={() => setShowForgotPassword(true)}
            >
              ¿Olvidaste tu contraseña?
            </Button>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </Button>
        </form>
        <div className="text-center text-sm">
          ¿No tienes cuenta?{" "}
          <Button variant="link" className="p-0 h-auto font-semibold" onClick={onSwitchToRegister}>
            Regístrate aquí
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
