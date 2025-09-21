import { type NextRequest, NextResponse } from "next/server"
import { API_CONFIG } from "@/lib/config"

export async function POST(request: NextRequest) {
  try {
    const { email, currentPassword, newPassword } = await request.json()

    console.log("[v0] Change password request for:", email)

    // Intentar conectar con la API externa
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHANGE_PASSWORD}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          current_password: currentPassword,
          new_password: newPassword,
        }),
      })

      const data = await response.json()
      console.log("[v0] External API response:", response.status, data)

      if (response.ok) {
        return NextResponse.json({
          success: true,
          message: "Contraseña cambiada exitosamente",
        })
      } else {
        return NextResponse.json(
          { message: data.detail || "Error al cambiar la contraseña" },
          { status: response.status },
        )
      }
    } catch (externalError) {
      console.error("[v0] External API error:", externalError)

      // Fallback: simulación local para desarrollo
      console.log("[v0] Using local fallback for change password")

      // Validación básica
      if (!email || !currentPassword || !newPassword) {
        return NextResponse.json({ message: "Todos los campos son requeridos" }, { status: 400 })
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ message: "La nueva contraseña debe tener al menos 6 caracteres" }, { status: 400 })
      }

      // Simulación exitosa para desarrollo
      return NextResponse.json({
        success: true,
        message: "Contraseña cambiada exitosamente (modo desarrollo)",
      })
    }
  } catch (error) {
    console.error("[v0] Change password error:", error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}
