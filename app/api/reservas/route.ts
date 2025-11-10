import { NextRequest, NextResponse } from 'next/server'
import { API_CONFIG } from '@/lib/config'
import { buildApiUrl, withApiHeaders } from '@/lib/api-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Agregar timestamp para prevenir cache
    const timestamp = new Date().getTime()
    console.log(`[${timestamp}] API POST /reservas - Creando reserva:`, body)

    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.RESERVAS, { _t: timestamp }), {
      method: 'POST',
      headers: withApiHeaders({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }),
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      console.error(`[${timestamp}] Error en API POST reservas:`, response.status, response.statusText)
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
      throw new Error(`Error del backend: ${response.status} - ${errorData.detail || errorData.error}`)
    }

    const data = await response.json()
    console.log(`[${timestamp}] Reserva creada:`, data)

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error al crear reserva:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const clienteId = url.searchParams.get('cliente_id')
    
    if (!clienteId) {
      return NextResponse.json(
        { error: 'ID de cliente requerido' }, 
        { status: 400 }
      )
    }

    // Agregar timestamp para prevenir cache
    const timestamp = new Date().getTime()
    console.log(`[${timestamp}] API GET /reservas - Cliente: ${clienteId}`)

    const response = await fetch(
      buildApiUrl(`${API_CONFIG.ENDPOINTS.RESERVAS}/${clienteId}`, { _t: timestamp }),
      {
        method: 'GET',
        headers: withApiHeaders({
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        })
      }
    })

    if (!response.ok) {
      console.error(`[${timestamp}] Error en API GET reservas:`, response.status, response.statusText)
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
      throw new Error(`Error del backend: ${response.status} - ${errorData.detail || errorData.error}`)
    }

    const data = await response.json()
    console.log(`[${timestamp}] Reservas obtenidas:`, data.length)

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error al obtener reservas:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      }, 
      { status: 500 }
    )
  }
}