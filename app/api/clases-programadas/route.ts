import { NextRequest, NextResponse } from 'next/server'
import { API_CONFIG } from '@/lib/config'
import { buildApiUrl, withApiHeaders } from '@/lib/api-client'

export async function GET(request: NextRequest) {
  try {
    // Agregar timestamp para prevenir cache
    const timestamp = new Date().getTime()
    console.log(`[${timestamp}] API /clases-programadas GET - Obteniendo clases programadas`)

    // Forward optional `filter_future` query param from the client to the backend
    const urlParams = new URL(request.url).searchParams
    const filterFutureParam = urlParams.get('filter_future')
    const params: any = { _t: timestamp }
    if (filterFutureParam !== null) params.filter_future = filterFutureParam

    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.CLASES_PROGRAMADAS, params), {
      method: 'GET',
      headers: withApiHeaders({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }),
    })

    if (!response.ok) {
      console.error(`[${timestamp}] Error en API clases-programadas GET:`, response.status, response.statusText)
      throw new Error(`Error del backend: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[${timestamp}] Clases programadas obtenidas:`, data.length)

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error al obtener clases programadas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Agregar timestamp para prevenir cache
    const timestamp = new Date().getTime()
    console.log(`[${timestamp}] API /clases-programadas - Guardando clases`)

    const body = await request.json()
    console.log(`[${timestamp}] Clases a guardar:`, body.clases?.length || 0)

    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.CLASES_PROGRAMADAS, { _t: timestamp }), {
      method: 'POST',
      headers: withApiHeaders({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }),
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      console.error(`[${timestamp}] Error en API clases-programadas:`, response.status, response.statusText)
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
      throw new Error(`Error del backend: ${response.status} - ${errorData.detail || errorData.error}`)
    }

    const data = await response.json()
    console.log(`[${timestamp}] Clases guardadas:`, data.total_guardadas, 'Errores:', data.total_errores)

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error al guardar clases programadas:', error)
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