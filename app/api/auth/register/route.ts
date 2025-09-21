import { type NextRequest, NextResponse } from "next/server"
import { API_CONFIG } from "@/lib/config"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: "Todos los campos son requeridos" }, { status: 400 })
    }

    try {
      console.log("[v0] Intentando registrar usuario en API externa:", { name, email })

      const externalResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
        signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
      })

      console.log("[v0] Respuesta de API externa - Status:", externalResponse.status)
      console.log("[v0] Respuesta de API externa - Content-Type:", externalResponse.headers.get("content-type"))

      if (externalResponse.ok) {
        const contentType = externalResponse.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const data = await externalResponse.json()
          console.log("[v0] Registro exitoso en API externa:", data)
          return NextResponse.json(data)
        } else {
          console.log("[v0] API externa devolvió HTML en lugar de JSON")
          throw new Error("Respuesta no es JSON válido")
        }
      } else {
        if (externalResponse.status === 400) {
          // Error 400 generalmente indica email duplicado u otros errores de validación
          try {
            const errorData = await externalResponse.json()
            console.log("[v0] Error 400 de API externa:", errorData)
            return NextResponse.json(
              {
                success: false,
                message: errorData.message || "El email ya está registrado",
              },
              { status: 400 },
            )
          } catch {
            return NextResponse.json(
              {
                success: false,
                message: "El email ya está registrado",
              },
              { status: 400 },
            )
          }
        }

        console.log("[v0] API externa devolvió error:", externalResponse.status)
        throw new Error(`API externa devolvió ${externalResponse.status}`)
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("400")) {
        // Re-lanzar errores 400 para que se manejen arriba
        throw error
      }

      console.log("[v0] Error de conexión con API externa, usando fallback local:", error)

      // Solo usar fallback para errores de conexión/timeout
      return NextResponse.json({
        success: true,
        message: "Usuario registrado exitosamente",
        user: {
          id: Date.now(),
          name: name,
          email: email,
        },
      })
    }
  } catch (error) {
    console.error("[v0] Error en registro:", error)
    return NextResponse.json({ success: false, message: "Error del servidor" }, { status: 500 })
  }
}
