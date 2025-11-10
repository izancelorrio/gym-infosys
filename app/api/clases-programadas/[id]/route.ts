import { NextRequest, NextResponse } from 'next/server'
import { API_CONFIG } from '@/lib/config'
import { buildApiUrl, withApiHeaders } from '@/lib/api-client'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const claseId = params.id
    
    if (!claseId) {
      return NextResponse.json(
        { error: 'ID de clase requerido' }, 
        { status: 400 }
      )
    }

    // Agregar timestamp para prevenir cache
    const timestamp = new Date().getTime()
    console.log(`[${timestamp}] API DELETE /clases-programadas/${claseId} - Eliminando clase`)

    const response = await fetch(
      buildApiUrl(`${API_CONFIG.ENDPOINTS.CLASES_PROGRAMADAS}/${claseId}`, { _t: timestamp }),
      {
        method: 'DELETE',
        headers: withApiHeaders({
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }),
    })

    if (!response.ok) {
      console.error(`[${timestamp}] Error en API DELETE clases-programadas:`, response.status, response.statusText)
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
      throw new Error(`Error del backend: ${response.status} - ${errorData.detail || errorData.error}`)
    }

    const data = await response.json()
    console.log(`[${timestamp}] Clase eliminada:`, data)

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error al eliminar clase programada:', error)
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