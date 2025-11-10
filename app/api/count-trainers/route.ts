import { NextResponse } from 'next/server'
import { API_CONFIG } from '@/lib/config'
import { buildApiUrl, withApiHeaders } from '@/lib/api-client'

export async function GET() {
  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.COUNT_TRAINERS), {
      headers: withApiHeaders(),
    })
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error al obtener el número de entrenadores:', error)
    return NextResponse.json({ error: 'Error al obtener el número de entrenadores' }, { status: 500 })
  }
}