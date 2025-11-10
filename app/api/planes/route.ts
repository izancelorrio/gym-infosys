import { NextRequest, NextResponse } from 'next/server'
import { API_CONFIG } from '@/lib/config'
import { buildApiUrl, withApiHeaders } from '@/lib/api-client'

export async function GET(request: NextRequest) {
  console.log('[DEBUG] planes: Starting API route')
  
  // Siempre intentar usar la API real primero
  try {
    const fullUrl = buildApiUrl(API_CONFIG.ENDPOINTS.PLANES, { _t: Date.now() })
    console.log('[DEBUG] planes: Full URL:', fullUrl)
    
    console.log('[DEBUG] planes: Making fetch request to backend...')
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: withApiHeaders({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }),
      // Timeout de 5 segundos
      signal: AbortSignal.timeout(5000)
    })

    console.log('[DEBUG] planes: Response received')
    console.log('[DEBUG] planes: Response status:', response.status)
    console.log('[DEBUG] planes: Response ok:', response.ok)

    if (!response.ok) {
      console.log('[DEBUG] planes: Response not ok, falling back to mock data')
      throw new Error(`Backend API responded with status ${response.status}`)
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
          { error: `No se puede conectar con el servidor backend en ${API_CONFIG.BASE_URL}.`, code: 'CONNECTION_FAILED' },
          { status: 503 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Error al cargar planes desde la API', 
        details: error instanceof Error ? error.message : 'Error desconocido',
        code: 'API_ERROR'
      },
      { status: 500 }
    )
  }
}