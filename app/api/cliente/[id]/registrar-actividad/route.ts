import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl, withApiHeaders } from '@/lib/api-client'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const timestamp = new Date().getTime()
    console.log(`[${timestamp}] Proxy POST /api/cliente/${id}/registrar-actividad -> backend`)

    const backendUrl = buildApiUrl(`/cliente/${id}/registrar-actividad`)
    const bodyText = await request.text()
    const contentType = request.headers.get('content-type') || 'application/json'

    const resp = await fetch(backendUrl, {
      method: 'POST',
      headers: withApiHeaders({ 'Content-Type': contentType }),
      body: bodyText
    })

    const text = await resp.text()
    const respContentType = resp.headers.get('content-type') || 'application/json'

    return new NextResponse(text, { status: resp.status, headers: { 'Content-Type': respContentType } })
  } catch (error) {
    console.error('Error proxying registrar-actividad:', error)
    return NextResponse.json({ error: 'Error interno al registrar actividad' }, { status: 500 })
  }
}
