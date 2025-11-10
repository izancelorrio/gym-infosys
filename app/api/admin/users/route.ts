import { NextRequest, NextResponse } from 'next/server'
import { API_CONFIG } from '@/lib/config'
import { buildApiUrl, withApiHeaders } from '@/lib/api-client'

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN_USERS, { _t: Date.now() }), {
      method: 'GET',
      headers: withApiHeaders({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Error al obtener usuarios' },
        { status: response.status }
      )
    }

    const responseObj = NextResponse.json(data)
    responseObj.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    responseObj.headers.set('Pragma', 'no-cache')
    responseObj.headers.set('Expires', '0')
    return responseObj
  } catch (error) {
    console.error('Error en admin/users route:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}