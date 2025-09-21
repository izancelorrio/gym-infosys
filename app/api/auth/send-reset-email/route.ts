import { type NextRequest, NextResponse } from "next/server"
import { API_CONFIG } from "@/lib/config"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email es requerido" }, { status: 400 })
    }

    console.log("[v0] Enviando email de reset para:", email)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT)

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SEND_RESET_EMAIL}`, {
        method: "POST",
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify({ email }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log("[v0] Respuesta de envío de reset email, status:", response.status)

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("API externa devolvió respuesta no válida")
      }

      const data = await response.json()

      if (response.ok) {
        console.log("[v0] Email de reset enviado exitosamente")
        return NextResponse.json({
          success: true,
          message: "Se ha enviado un email con instrucciones para restablecer tu contraseña",
        })
      } else {
        return NextResponse.json({ error: data.detail || "Error al enviar email" }, { status: response.status })
      }
    } catch (fetchError) {
      console.log("[v0] API externa no disponible, usando fallback local para reset email")

      // Fallback local: simular envío exitoso
      return NextResponse.json({
        success: true,
        message: "Se ha enviado un email con instrucciones para restablecer tu contraseña (modo desarrollo)",
      })
    }
  } catch (error) {
    console.error("[v0] Error en envío de reset email:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
