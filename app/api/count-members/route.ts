import { NextResponse } from "next/server"
import { API_CONFIG } from "@/lib/config"

export async function GET() {
  console.log("[DEBUG] count-members: Starting API route")
  console.log("[DEBUG] count-members: Starting count request")
  
  try {
    const fullUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COUNT_MEMBERS}`
    console.log("[DEBUG] count-members: Full URL:", fullUrl)
    console.log("[DEBUG] count-members: API_CONFIG.BASE_URL:", API_CONFIG.BASE_URL)
    console.log("[DEBUG] count-members: API_CONFIG.ENDPOINTS.COUNT_MEMBERS:", API_CONFIG.ENDPOINTS.COUNT_MEMBERS)

    console.log("[DEBUG] count-members: Making fetch request to backend...")
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        ...API_CONFIG.HEADERS,
        "Cache-Control": "no-cache",
      },
    })

    console.log("[DEBUG] count-members: Response received")
    console.log("[DEBUG] count-members: Response status:", response.status)
    console.log("[DEBUG] count-members: Response ok:", response.ok)
    console.log("[DEBUG] count-members: Response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      console.log("[DEBUG] count-members: API response not ok, status:", response.status)
      console.log("[DEBUG] count-members: Response status text:", response.statusText)
      
      // Intentar leer el contenido del error
      let errorText = ""
      try {
        errorText = await response.text()
        console.log("[DEBUG] count-members: Error response text:", errorText)
      } catch (e) {
        console.log("[DEBUG] count-members: Could not read error text:", e)
      }
      
      return NextResponse.json(
        {
          error: `Backend API error: ${response.status} ${response.statusText}`,
          debug: { fullUrl, status: response.status, errorText },
          mode: "error",
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("[DEBUG] count-members: Success! API response data:", JSON.stringify(data, null, 2))
    
    if (data.count !== undefined) {
      console.log("[DEBUG] count-members: Returning count:", data.count)
      return NextResponse.json({ count: data.count, mode: "api" })
    }

    console.log("[DEBUG] count-members: No count field in response, returning error")
    return NextResponse.json(
      {
        error: "Backend API response missing count field",
        debug: { fullUrl, data },
        mode: "missing-count",
      },
      { status: 502 }
    )
  } catch (error) {
    console.error("[DEBUG] count-members: Error in route:", error)
    console.error("[DEBUG] count-members: Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    })
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        debug: {
          fullUrl: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COUNT_MEMBERS}`,
          errorType: typeof error,
        },
        mode: "error",
      },
      { status: 500 }
    )
  }
}
