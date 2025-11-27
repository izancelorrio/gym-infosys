import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl, withApiHeaders } from '@/lib/api-client'

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const timestamp = new Date().getTime()
    console.log(`[${timestamp}] Proxy DELETE /api/entrenamientos-asignados/${id} -> backend`)

    // Preserve query string (e.g., ?cliente_user_id=1)
    const search = request.nextUrl.search || ''
    const backendUrl = buildApiUrl(`/entrenamientos-asignados/${id}`) + search

    const resp = await fetch(backendUrl, {
      method: 'DELETE',
      headers: withApiHeaders({ 'Content-Type': request.headers.get('content-type') || 'application/json' }),
    })

    const text = await resp.text()
    const respContentType = resp.headers.get('content-type') || 'application/json'

    return new NextResponse(text, { status: resp.status, headers: { 'Content-Type': respContentType } })
  } catch (error) {
    console.error('Error proxying entrenamientos-asignados DELETE:', error)
    return NextResponse.json({ error: 'Error interno al eliminar asignacion' }, { status: 500 })
  }
}
