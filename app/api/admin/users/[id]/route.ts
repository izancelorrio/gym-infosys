import { NextRequest, NextResponse } from 'next/server'
import { API_CONFIG } from '@/lib/config'
import { buildApiUrl, withApiHeaders } from '@/lib/api-client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    const response = await fetch(
      buildApiUrl(`${API_CONFIG.ENDPOINTS.ADMIN_USERS}/${userId}`, { _t: Date.now() }),
      {
        method: 'GET',
        headers: withApiHeaders({
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Error al obtener usuario' },
        { status: response.status }
      )
    }

    const responseObj = NextResponse.json(data)
    responseObj.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    responseObj.headers.set('Pragma', 'no-cache')
    responseObj.headers.set('Expires', '0')
    return responseObj
  } catch (error) {
    console.error('Error en admin/users/[id] route:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id
    const body = await request.json()

    const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.ADMIN_USERS}/${userId}`), {
      method: 'PUT',
      headers: withApiHeaders({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }),
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Error al actualizar usuario' },
        { status: response.status }
      )
    }

    const responseObj = NextResponse.json(data)
    responseObj.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    responseObj.headers.set('Pragma', 'no-cache')
    responseObj.headers.set('Expires', '0')
    return responseObj
  } catch (error) {
    console.error('Error en PUT admin/users/[id] route:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}