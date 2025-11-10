import { NextRequest, NextResponse } from 'next/server'
import { API_CONFIG } from '@/lib/config'
import { buildApiUrl, withApiHeaders } from '@/lib/api-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.CONTRACT_PLAN), {
      method: 'POST',
      headers: withApiHeaders(),
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Error al contratar plan' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error en contract-plan route:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}