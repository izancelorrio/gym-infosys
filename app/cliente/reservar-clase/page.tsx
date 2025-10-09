"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, ArrowLeft, MapPin, User2, CheckCircle } from "lucide-react"

// Interfaces para las clases programadas
interface ClaseProgramada {
  id: number
  tipo: string
  instructor: string
  fecha: string
  hora: string
  color?: string
  capacidad_maxima?: number
  participantes_actuales?: number
  plazas_libres?: number
  descripcion?: string
  ubicacion?: string
  duracion_minutos?: number
}

interface TipoClase {
  id: number
  nombre: string
  descripcion: string
  color: string
}

export default function ReservarClasePage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [filtroTipo, setFiltroTipo] = useState("Todos")
  const [clasesReservadas, setClasesReservadas] = useState<number[]>([])
  const [clasesProgramadas, setClasesProgramadas] = useState<ClaseProgramada[]>([])
  const [tiposClase, setTiposClase] = useState<string[]>(["Todos"])
  const [loading, setLoading] = useState(true)
  const [reservasCliente, setReservasCliente] = useState<any[]>([])

  // Cargar reservas existentes del cliente
  const cargarReservasCliente = async () => {
    if (!user?.cliente?.id) return

    try {
      const timestamp = new Date().getTime()
      console.log(`[${timestamp}] Cargando reservas del cliente...`)

      const response = await fetch(`/api/reservas?cliente_id=${user.cliente.id}&_t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })

      if (response.ok) {
        const reservas = await response.json()
        const clasesReservadasIds = reservas.map((reserva: any) => reserva.id_clase_programada)
        setClasesReservadas(clasesReservadasIds)
        setReservasCliente(reservas) // Guardar las reservas completas para obtener IDs
        console.log(`[${timestamp}] Reservas cargadas:`, clasesReservadasIds)
      }
    } catch (error) {
      console.error('Error al cargar reservas:', error)
    }
  }

  // Cargar clases programadas desde la API
  const cargarClasesProgramadas = async () => {
    try {
      const timestamp = new Date().getTime()
      console.log(`[${timestamp}] Cargando clases programadas para cliente...`)

      const response = await fetch(`/api/clases-programadas?_t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })

      if (!response.ok) {
        throw new Error('Error al cargar las clases programadas')
      }

      const data = await response.json()
      console.log(`[${timestamp}] Clases programadas cargadas:`, data.length, data)
      
      // Procesar datos para agregar información adicional
      const clasesConDatos = data.map((clase: any) => {
        console.log('Procesando clase:', clase)
        return {
          id: clase.id,
          tipo: clase.tipo_clase || clase.tipo, // Usar tipo_clase de la API
          instructor: clase.instructor_nombre || clase.instructor, // Usar instructor_nombre de la API
          fecha: clase.fecha,
          hora: clase.hora,
          color: clase.color,
          capacidad_maxima: clase.capacidad_maxima || 15,
          participantes_actuales: clase.participantes_actuales || 0, // Usar datos reales de la API
          plazas_libres: clase.plazas_libres || 0, // Usar plazas reales calculadas en la API
          descripcion: clase.descripcion || `Clase de ${clase.tipo_clase || clase.tipo} impartida por ${clase.instructor_nombre || clase.instructor}`,
          ubicacion: "Sala Principal", // Por defecto, se podría agregar a la BD
          duracion_minutos: clase.duracion_minutos || 60
        }
      })

      setClasesProgramadas(clasesConDatos)
      
      // Extraer tipos únicos para los filtros
      const tiposSet = new Set<string>()
      tiposSet.add("Todos")
      data.forEach((clase: any) => {
        const tipoClase = clase.tipo_clase || clase.tipo
        if (tipoClase && typeof tipoClase === 'string') {
          tiposSet.add(tipoClase)
        }
      })
      setTiposClase(Array.from(tiposSet))
      
    } catch (error) {
      console.error('Error al cargar clases programadas:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "cliente") {
      router.push("/")
    } else {
      const cargarDatos = async () => {
        await cargarClasesProgramadas()
        await cargarReservasCliente()
      }
      cargarDatos()
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || user?.role !== "cliente") {
    return null
  }

  // Filtrar clases basándose en el tipo seleccionado
  const clasesFiltradas = clasesProgramadas.filter((clase: ClaseProgramada) => 
    filtroTipo === "Todos" || clase.tipo === filtroTipo
  )

  const reservarClase = async (claseId: number) => {
    try {
      // Obtener el ID del cliente del usuario autenticado
      if (!user?.cliente?.id) {
        alert("❌ Error: No se pudo obtener la información del cliente")
        return
      }

      const timestamp = new Date().getTime()
      console.log(`[${timestamp}] Reservando clase ${claseId} para cliente ${user.cliente.id}`)

      const response = await fetch(`/api/reservas?_t=${timestamp}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify({
          id_cliente: user.cliente.id,
          id_clase_programada: claseId
        })
      })

      const resultado = await response.json()

      if (!response.ok) {
        throw new Error(resultado.detail || 'Error al reservar la clase')
      }

      console.log(`[${timestamp}] Clase reservada exitosamente:`, resultado)
      
      // Agregar a la lista local de clases reservadas
      setClasesReservadas([...clasesReservadas, claseId])
      
      // Mostrar mensaje de éxito
      alert(`✅ ¡RESERVA CONFIRMADA!\n\nClase: ${resultado.clase_info.tipo}\nFecha: ${resultado.clase_info.fecha}\nHora: ${resultado.clase_info.hora}\n\n¡Nos vemos en la clase!`)
      
      // Recargar las clases para actualizar la ocupación
      await cargarClasesProgramadas()
      
    } catch (error) {
      console.error('Error al reservar clase:', error)
      alert(`❌ Error al reservar la clase: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  const anularReserva = async (claseId: number, tipoClase: string, fecha: string, hora: string) => {
    try {
      // Recargar las reservas del cliente para obtener datos actualizados
      if (!user?.cliente?.id) {
        alert("❌ Error: No se pudo obtener la información del cliente")
        return
      }

      // Obtener la reserva directamente del backend
      const ts = new Date().getTime()
      const reservasResponse = await fetch(`/api/reservas?cliente_id=${user.cliente.id}&_t=${ts}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })

      if (!reservasResponse.ok) {
        throw new Error('No se pudieron cargar las reservas')
      }

      const reservasActualizadas = await reservasResponse.json()
      const reserva = reservasActualizadas.find((r: any) => r.id_clase_programada === claseId)
      
      if (!reserva) {
        alert("❌ Error: No se pudo encontrar la reserva activa para esta clase")
        return
      }

      // Pedir confirmación al usuario
      const fechaFormateada = new Date(fecha).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      
      const confirmacion = window.confirm(
        `🗑️ ANULAR RESERVA\n\n` +
        `Clase: ${tipoClase}\n` +
        `Fecha: ${fechaFormateada}\n` +
        `Hora: ${hora}\n\n` +
        `¿Estás seguro de que quieres anular esta reserva?`
      )
      
      if (!confirmacion) {
        return
      }

      const timestampDelete = new Date().getTime()
      console.log(`[${timestampDelete}] Anulando reserva ${reserva.id} para clase ${claseId}`)

      const response = await fetch(`/api/reservas/${reserva.id}?_t=${timestampDelete}`, {
        method: 'DELETE',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })

      const resultado = await response.json()

      if (!response.ok) {
        throw new Error(resultado.detail || 'Error al anular la reserva')
      }

      console.log(`[${timestampDelete}] Reserva anulada exitosamente:`, resultado)
      
      // Quitar de la lista local de clases reservadas
      setClasesReservadas(clasesReservadas.filter(id => id !== claseId))
      
      // Mostrar mensaje de éxito
      alert(`✅ RESERVA ANULADA\n\nLa reserva para la clase de ${tipoClase} del ${fechaFormateada} a las ${hora} ha sido anulada correctamente.`)
      
      // Recargar datos para actualizar la ocupación
      await cargarClasesProgramadas()
      await cargarReservasCliente()
      
    } catch (error) {
      console.error('Error al anular reserva:', error)
      alert(`❌ Error al anular la reserva: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  const formatearFecha = (fechaString: string) => {
    const fecha = new Date(fechaString)
    return fecha.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long"
    })
  }

  const getColorTipo = (tipo: string, color?: string) => {
    // Si hay color de la BD, usarlo, sino usar colores por defecto
    if (color) {
      return `${color} text-white`
    }
    
    const colores = {
      "Pilates": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      "CrossFit": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      "Yoga": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      "Spinning": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      "Zumba": "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200"
    }
    return colores[tipo as keyof typeof colores] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-lg shadow-lg mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-full">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Reservar Clases</h1>
                <p className="text-white/90">Encuentra y reserva las clases que más te gusten</p>
              </div>
            </div>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filtrar por tipo de clase</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tiposClase.map((tipo) => {
                const clasesDelTipo = tipo === "Todos" 
                  ? clasesProgramadas.length 
                  : clasesProgramadas.filter(c => c.tipo === tipo).length
                
                return (
                  <Button
                    key={tipo}
                    variant={filtroTipo === tipo ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFiltroTipo(tipo)}
                    className="mb-2 flex items-center gap-2"
                  >
                    {tipo}
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {clasesDelTipo}
                    </Badge>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Lista de clases */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando clases disponibles...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {clasesFiltradas.map((clase: ClaseProgramada) => {
              const yaReservada = clasesReservadas.includes(clase.id)
              
              return (
                <div key={clase.id} className={`relative p-3 rounded border-2 ${clase.color || 'bg-gray-100 text-gray-800'} hover:shadow-md transition-all duration-200 flex flex-col h-48`}>
                  {/* Fecha */}
                  <div className="text-sm font-semibold mb-1 opacity-95">
                    {formatearFecha(clase.fecha)}
                  </div>
                  
                  {/* Tipo de clase */}
                  <div className="font-bold text-base mb-1">{clase.tipo}</div>
                  
                  {/* Información básica */}
                  <div className="space-y-1 mb-2 flex-grow">
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-3 w-3" />
                      {clase.hora} ({clase.duracion_minutos || 60}min)
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <User2 className="h-3 w-3" />
                      {clase.instructor}
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Users className="h-3 w-3" />
                      {clase.participantes_actuales || 0}/{clase.capacidad_maxima || 15}
                    </div>
                  </div>

                  {/* Botón de reserva */}
                  <div className="flex justify-center mt-auto">
                    {yaReservada ? (
                      <div className="flex items-center gap-2">
                        <Button 
                          disabled 
                          size="sm"
                          className="bg-green-600 text-white h-6 text-xs px-3"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Reservada
                        </Button>
                        <Button 
                          onClick={() => anularReserva(clase.id, clase.tipo, clase.fecha, clase.hora)}
                          size="sm"
                          className="bg-red-600 text-white h-6 text-xs px-2 hover:bg-red-700"
                        >
                          Anular
                        </Button>
                      </div>
                    ) : (clase.plazas_libres || 0) > 0 ? (
                      <Button
                        onClick={() => reservarClase(clase.id)}
                        size="sm"
                        className="h-6 text-xs bg-primary text-primary-foreground hover:bg-primary/90 px-3"
                      >
                        Reservar
                      </Button>
                    ) : (
                      <Button 
                        disabled 
                        size="sm"
                        className="bg-white text-black h-6 text-xs px-3 cursor-not-allowed font-semibold border border-gray-300"
                      >
                        🚫 Sin plazas
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {clasesFiltradas.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              No hay clases disponibles
            </h3>
            <p className="text-muted-foreground">
              No se encontraron clases del tipo "{filtroTipo}" con plazas disponibles.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}