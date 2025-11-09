import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('http://localhost:8000/count-trainers')
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error al obtener el número de entrenadores:', error)
    return NextResponse.json({ error: 'Error al obtener el número de entrenadores' }, { status: 500 })
  }
}