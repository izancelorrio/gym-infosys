"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Token de verificación no encontrado")
      return
    }

    const verifyEmail = async () => {
      try {
        console.log("[v0] Verificando email con token:", token)

        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()
        console.log("[v0] Respuesta de verificación:", data)

        if (response.ok && data.success) {
          setStatus("success")
          setMessage(data.message)
        } else {
          setStatus("error")
          setMessage(data.error || "Error al verificar el email")
        }
      } catch (error) {
        console.error("[v0] Error en verificación:", error)
        setStatus("error")
        setMessage("Error de conexión. Inténtalo de nuevo.")
      }
    }

    verifyEmail()
  }, [token])

  const handleGoToLogin = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === "loading" && (
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            )}
            {status === "success" && (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            )}
            {status === "error" && (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            )}
          </div>

          <CardTitle className="text-2xl font-bold">
            {status === "loading" && "Verificando Email..."}
            {status === "success" && "¡Email Verificado!"}
            {status === "error" && "Error de Verificación"}
          </CardTitle>

          <CardDescription>
            {status === "loading" && "Por favor espera mientras verificamos tu email"}
            {status === "success" && "Tu cuenta ha sido activada exitosamente"}
            {status === "error" && "No pudimos verificar tu email"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div
            className={`p-4 rounded-lg ${
              status === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : status === "error"
                  ? "bg-red-50 border border-red-200 text-red-700"
                  : "bg-blue-50 border border-blue-200 text-blue-700"
            }`}
          >
            <p className="text-sm">{message}</p>
          </div>

          {status !== "loading" && (
            <Button onClick={handleGoToLogin} className="w-full">
              Ir a Iniciar Sesión
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
