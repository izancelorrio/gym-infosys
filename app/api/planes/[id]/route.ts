import { API_CONFIG } from '@/lib/config'
import { buildApiUrl, withApiHeaders } from '@/lib/api-client'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[DEBUG] planes/[id]: Starting API route for ID:', params.id)

  const planId = Number(params.id)

  if (Number.isNaN(planId)) {
    return NextResponse.json({ error: 'ID de plan inválido' }, { status: 400 })
  }

  try {
    const fullUrl = buildApiUrl(`${API_CONFIG.ENDPOINTS.PLANES}/${planId}`)
    console.log('[DEBUG] planes/[id]: Full URL:', fullUrl)

    console.log('[DEBUG] planes/[id]: Making fetch request to backend...')

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: withApiHeaders({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      }),
      signal: AbortSignal.timeout(5000),
    })

    console.log('[DEBUG] planes/[id]: Response received')
    console.log('[DEBUG] planes/[id]: Response status:', response.status)

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 })
      }

      const errorText = await response.text()
      console.log('[DEBUG] planes/[id]: Error response text:', errorText)
      throw new Error(`Backend API responded with status ${response.status}`)
    }

    const data = await response.json()
    console.log('[DEBUG] planes/[id]: Success! API response data:', JSON.stringify(data, null, 2))

    return NextResponse.json(data)
  } catch (error) {
    console.error('[DEBUG] planes/[id]: Error occurred:', error)

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Timeout: La API tardó demasiado en responder' },
          { status: 504 }
        )
      }

      if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
        return NextResponse.json(
          { error: `No se puede conectar con el servidor backend en ${API_CONFIG.BASE_URL}.` },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}