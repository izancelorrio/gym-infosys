import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Agregar timestamp para prevenir cache
    const timestamp = new Date().getTime()
    console.log(`[${timestamp}] API /entrenadores - Solicitando entrenadores`)

    const response = await fetch(`http://localhost:8000/entrenadores?_t=${timestamp}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    })

    if (!response.ok) {
      console.error(`[${timestamp}] Error en API entrenadores:`, response.status, response.statusText)
      throw new Error(`Error del backend: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[${timestamp}] Entrenadores obtenidos:`, data.length, 'entrenadores')

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error al obtener entrenadores:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}