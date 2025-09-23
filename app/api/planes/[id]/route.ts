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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[DEBUG] planes/[id]: Starting API route for ID:', params.id)
  console.log('[DEBUG] planes/[id]: API_DISPONIBLE:', API_DISPONIBLE)

  const planId = parseInt(params.id)
  
  if (isNaN(planId)) {
    return NextResponse.json(
      { error: 'ID de plan inválido' },
      { status: 400 }
    )
  }

  if (!API_DISPONIBLE) {
    console.log('[DEBUG] planes/[id]: API not available, returning mock data')
    
    // Datos mock
    const mockPlanes = [
      {
        id: 1,
        nombre: "Básico",
        descripcion: "Plan perfecto para comenzar tu transformación",
        precio_mensual: 29.99,
        precio_anual: 299.99,
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
        color_tema: "#10b981"
      },
      {
        id: 2,
        nombre: "Estándar",
        descripcion: "El plan más popular para usuarios regulares",
        precio_mensual: 49.99,
        precio_anual: 499.99,
        caracteristicas: [
          "Todo lo del plan Básico",
          "Acceso a clases grupales",
          "Horario extendido (24/7)",
          "1 sesión mensual con nutricionista"
        ],
        limite_clases: null,
        acceso_nutricionista: true,
        acceso_entrenador_personal: false,
        acceso_areas_premium: false,
        popular: true,
        color_tema: "#3b82f6"
      },
      {
        id: 3,
        nombre: "Premium",
        descripcion: "Para los más exigentes y comprometidos",
        precio_mensual: 89.99,
        precio_anual: 899.99,
        caracteristicas: [
          "Todo lo del plan Estándar",
          "Entrenador personal (2 sesiones/mes)",
          "Acceso a áreas premium",
          "Evaluaciones corporales mensuales"
        ],
        limite_clases: null,
        acceso_nutricionista: true,
        acceso_entrenador_personal: true,
        acceso_areas_premium: true,
        popular: false,
        color_tema: "#8b5cf6"
      }
    ]

    const plan = mockPlanes.find(p => p.id === planId)
    if (!plan) {
      return NextResponse.json(
        { error: 'Plan no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(plan)
  }

  try {
    const fullUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PLANES}/${planId}`
    console.log('[DEBUG] planes/[id]: Full URL:', fullUrl)
    
    console.log('[DEBUG] planes/[id]: Making fetch request to backend...')
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000)
    })

    console.log('[DEBUG] planes/[id]: Response received')
    console.log('[DEBUG] planes/[id]: Response status:', response.status)

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Plan no encontrado' },
          { status: 404 }
        )
      }
      
      const errorText = await response.text()
      console.log('[DEBUG] planes/[id]: Error response text:', errorText)
      throw new Error(`Backend API responded with status ${response.status}`)
    }

    const data = await response.json()
    console.log('[DEBUG] planes/[id]: Success! API response data:', JSON.stringify(data, null, 2))
    
    return NextResponse.json(data)

  } catch (error) {
    console.error('[DEBUG] planes/[id]: Error occurred:', error)
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Timeout: La API tardó demasiado en responder' },
          { status: 504 }
        )
      }
      
      if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
        return NextResponse.json(
          { error: 'No se puede conectar con el servidor backend' },
          { status: 503 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}