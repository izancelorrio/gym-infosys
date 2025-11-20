import { NextResponse } from "next/server"
import { API_CONFIG } from "@/lib/config"
import { buildApiUrl } from "@/lib/api-client"

export async function GET() {
  try {
    console.log("[DEBUG] Testing API health check...")

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT)

    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.HEALTH), {
      method: "GET",
      headers: API_CONFIG.HEADERS,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    console.log("[DEBUG] Health check response status:", response.status)
    
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`)
    }

    const data = await response.json()
    console.log("[DEBUG] Health check response:", data)

    return NextResponse.json(data)
  } catch (error) {
    console.error("[ERROR] Health check failed:", error)
    return NextResponse.json(
      { error: "API health check failed" },
      { status: 503 }
    )
  }
}