import { NextRequest, NextResponse } from 'next/server'
import { API_CONFIG } from '@/lib/config'
import { buildApiUrl, withApiHeaders } from '@/lib/api-client'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reservaId = params.id
    
    if (!reservaId) {
      return NextResponse.json(
        { error: 'ID de reserva requerido' }, 
        { status: 400 }
      )
    }

    // Agregar timestamp para prevenir cache
    const timestamp = new Date().getTime()
    console.log(`[${timestamp}] API DELETE /reservas/${reservaId} - Anulando reserva`)

    const response = await fetch(
      buildApiUrl(`${API_CONFIG.ENDPOINTS.RESERVAS}/${reservaId}`, { _t: timestamp }),
      {
        method: 'DELETE',
        headers: withApiHeaders({
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }),
    })

    if (!response.ok) {
      console.error(`[${timestamp}] Error en API DELETE reservas:`, response.status, response.statusText)
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
      throw new Error(`Error del backend: ${response.status} - ${errorData.detail || errorData.error}`)
    }

    const data = await response.json()
    console.log(`[${timestamp}] Reserva anulada:`, data)

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error al anular reserva:', error)
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