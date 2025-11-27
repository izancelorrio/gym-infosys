import { NextRequest, NextResponse } from 'next/server'
import { API_CONFIG } from '@/lib/config'
import { buildApiUrl, withApiHeaders } from '@/lib/api-client'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const timestamp = new Date().getTime()
    console.log(`[${timestamp}] Proxy /api/user/${id}/reservas -> backend`)

    const backendUrl = buildApiUrl(`/user/${id}/reservas`, { _t: timestamp })

    const resp = await fetch(backendUrl, {
      method: 'GET',
      headers: withApiHeaders({ 'Cache-Control': 'no-cache, no-store, must-revalidate' }),
    })

    const text = await resp.text()
    const contentType = resp.headers.get('content-type') || 'application/json'

    return new NextResponse(text, {
      status: resp.status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  } catch (error) {
    console.error('Error proxying /user/:id/reservas:', error)
    return NextResponse.json({ error: 'Error interno al obtener reservas' }, { status: 500 })
  }
}
