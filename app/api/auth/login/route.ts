import { type NextRequest, NextResponse } from "next/server"
import { API_CONFIG } from "@/lib/config"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    console.log("[v0] Intentando conectar a API externa...")

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT)

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
        method: "POST",
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify({
          email: email,
          password: password,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log("[v0] Respuesta recibida, status:", response.status)
      console.log("[v0] Content-Type:", response.headers.get("content-type"))

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text()
        console.log("[v0] Respuesta no es JSON:", textResponse.substring(0, 200))
        throw new Error("API externa devolvió respuesta no válida")
      }

      const data = await response.json()
      console.log("[DEBUG] Datos parseados correctamente:", JSON.stringify(data, null, 2))
      console.log("[DEBUG] Response OK:", response.ok)
      console.log("[DEBUG] Response status:", response.status)

      if (response.ok) {
        console.log("[DEBUG] Processing successful login response")
        console.log("[DEBUG] User data:", JSON.stringify(data.user, null, 2))
        
        if (data.user && data.user.verified === false) {
          console.log("[DEBUG] Usuario no verificado:", data.user.email)
          return NextResponse.json(
            {
              error:
                "Tu cuenta no está verificada. Por favor, revisa tu email y haz clic en el enlace de verificación.",
              needsVerification: true,
            },
            { status: 403 },
          )
        }

        if (data.user && !data.user.role) {
          console.log("[DEBUG] Adding default role to user")
          data.user.role = "usuario"
        }

        console.log("[DEBUG] Returning successful login response:", JSON.stringify(data, null, 2))
        return NextResponse.json(data)
      } else {
        console.log("[DEBUG] Login failed, returning error")
        return NextResponse.json({ error: data.detail || "Credenciales inválidas" }, { status: response.status })
      }
    } catch (fetchError) {
      console.log("[v0] API externa no disponible")
      return NextResponse.json(
        {
          error: "Servicio de autenticación no disponible. Por favor, inténtalo más tarde.",
        },
        { status: 503 },
      )
    }
  } catch (error) {
    console.error("[v0] Error en login:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
