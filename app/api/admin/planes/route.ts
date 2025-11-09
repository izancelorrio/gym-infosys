import { NextResponse } from "next/server"

export async function GET() {
  console.log('📝 [DEBUG] Iniciando solicitud GET /api/admin/planes')
  try {
    // Usar directamente la URL de desarrollo
    const apiUrl = 'http://localhost:8000'
    console.log('📝 [DEBUG] URL de la API:', apiUrl)

    const response = await fetch(`${apiUrl}/planes`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

    console.log('📝 [DEBUG] Status de la respuesta:', response.status)
    
    if (!response.ok) {
      throw new Error(`Error al obtener los planes: ${response.status}`)
    }

    const data = await response.json()
    console.log('📝 [DEBUG] Datos recibidos:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ [ERROR] Error en /api/admin/planes:', error)
    return NextResponse.json(
      { error: 'Error al obtener los planes' },
      { status: 500 }
    )
  }
}