import { NextRequest, NextResponse } from 'next/server'

// Configuración de la API
const API_CONFIG = {
  BASE_URL: process.env.API_BASE_URL || 'http://127.0.0.1:8000',
  ENDPOINTS: {
    PLANES: '/planes'
  }
}

// Verificar si la API está disponible
const API_DISPONIBLE = process.env.API_DISPONIBLE === '1'

export async function GET(request: NextRequest) {
  console.log('[DEBUG] planes: Starting API route')
  console.log('[DEBUG] planes: API_DISPONIBLE:', API_DISPONIBLE)

  if (!API_DISPONIBLE) {
    console.log('[DEBUG] planes: API not available, returning mock data')
    // Datos mock para desarrollo cuando la API no está disponible
    const mockPlanes = [
      {
        id: 1,
        nombre: "Básico",
        descripcion: "Plan perfecto para comenzar tu transformación",
        precio_mensual: 29.99,
        precio_anual: 299.99,
        duracion_meses: 1,
        caracteristicas: [
          "Acceso a todas las máquinas",
          "Vestuarios y duchas", 
          "Wi-Fi gratuito",
          "Horario estándar (6:00 - 22:00)"
        ],
        limite_clases: 8,
        acceso_nutricionista: false,
        acceso_entrenador_personal: false,
        acceso_areas_premium: false,
        popular: false,
        activo: true,
        color_tema: "#10b981",
        orden_display: 1
      },
      {
        id: 2,
        nombre: "Estándar",
        descripcion: "El plan más popular para usuarios regulares",
        precio_mensual: 49.99,
        precio_anual: 499.99,
        duracion_meses: 1,
        caracteristicas: [
          "Todo lo del plan Básico",
          "Acceso a clases grupales",
          "Horario extendido (24/7)",
          "1 sesión mensual con nutricionista",
          "Descuentos en tienda"
        ],
        limite_clases: null,
        acceso_nutricionista: true,
        acceso_entrenador_personal: false,
        acceso_areas_premium: false,
        popular: true,
        activo: true,
        color_tema: "#3b82f6",
        orden_display: 2
      },
      {
        id: 3,
        nombre: "Premium",
        descripcion: "Para los más exigentes y comprometidos",
        precio_mensual: 89.99,
        precio_anual: 899.99,
        duracion_meses: 1,
        caracteristicas: [
          "Todo lo del plan Estándar",
          "Entrenador personal (2 sesiones/mes)",
          "Acceso a áreas premium",
          "Evaluaciones corporales mensuales",
          "Invitado gratis semanal",
          "Toallas incluidas"
        ],
        limite_clases: null,
        acceso_nutricionista: true,
        acceso_entrenador_personal: true,
        acceso_areas_premium: true,
        popular: false,
        activo: true,
        color_tema: "#8b5cf6",
        orden_display: 3
      }
    ]

    return NextResponse.json({ planes: mockPlanes })
  }

  try {
    const fullUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PLANES}`
    console.log('[DEBUG] planes: Full URL:', fullUrl)
    console.log('[DEBUG] planes: API_CONFIG.BASE_URL:', API_CONFIG.BASE_URL)
    console.log('[DEBUG] planes: API_CONFIG.ENDPOINTS.PLANES:', API_CONFIG.ENDPOINTS.PLANES)
    
    console.log('[DEBUG] planes: Making fetch request to backend...')
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Timeout de 5 segundos
      signal: AbortSignal.timeout(5000)
    })

    console.log('[DEBUG] planes: Response received')
    console.log('[DEBUG] planes: Response status:', response.status)
    console.log('[DEBUG] planes: Response ok:', response.ok)
    
    const responseHeaders: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })
    console.log('[DEBUG] planes: Response headers:', JSON.stringify(responseHeaders, null, 2))

    if (!response.ok) {
      console.log('[DEBUG] planes: Response not ok, status:', response.status)
      const errorText = await response.text()
      console.log('[DEBUG] planes: Error response text:', errorText)
      throw new Error(`Backend API responded with status ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log('[DEBUG] planes: Success! API response data:', JSON.stringify(data, null, 2))
    
    return NextResponse.json(data)

  } catch (error) {
    console.error('[DEBUG] planes: Error occurred:', error)
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('[DEBUG] planes: Request timed out')
        return NextResponse.json(
          { error: 'Timeout: La API tardó demasiado en responder', code: 'TIMEOUT' },
          { status: 504 }
        )
      }
      
      if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
        console.error('[DEBUG] planes: Connection refused or fetch failed')
        return NextResponse.json(
          { error: 'No se puede conectar con el servidor backend', code: 'CONNECTION_FAILED' },
          { status: 503 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor', 
        details: error instanceof Error ? error.message : 'Error desconocido',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}