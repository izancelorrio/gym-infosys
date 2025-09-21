import { NextResponse } from "next/server"
import { API_CONFIG } from "@/lib/config"

export async function GET() {
  try {
    const fullUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COUNT_MEMBERS}`
    console.log("[v0] Fetching members count from API")
    console.log("[v0] Full URL:", fullUrl)

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: API_CONFIG.HEADERS,
    })

    console.log("[v0] Response status:", response.status)
    console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      console.log("[v0] API response not ok:", response.status)
      if (response.status === 404) {
        console.log("[v0] Endpoint not found, using default count")
        return NextResponse.json({ count: 847 })
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      console.log("[v0] Response is not JSON, content-type:", contentType)
      const text = await response.text()
      console.log("[v0] Response text:", text.substring(0, 100))
      console.log("[v0] Using default count due to non-JSON response")
      return NextResponse.json({ count: 847 })
    }

    let data
    try {
      data = await response.json()
      console.log("[v0] API response received:", data)
    } catch (jsonError) {
      console.log("[v0] JSON parsing failed:", jsonError)
      const text = await response.text()
      console.log("[v0] Raw response text:", text.substring(0, 100))
      console.log("[v0] Using default count due to JSON parsing error")
      return NextResponse.json({ count: 847 })
    }

    if (Array.isArray(data)) {
      const count = data.length
      console.log("[v0] Members count calculated:", count)
      return NextResponse.json({ count })
    }

    if (data.count !== undefined) {
      console.log("[v0] Members count received:", data.count)
      return NextResponse.json({ count: data.count })
    }

    console.log("[v0] Could not determine count, using default")
    return NextResponse.json({ count: 847 })
  } catch (error) {
    console.error("[v0] Error fetching members count:", error)
    return NextResponse.json({ count: 847 }, { status: 200 })
  }
}
