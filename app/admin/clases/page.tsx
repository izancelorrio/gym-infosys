"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from '@/components/ui/toast'
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users, ArrowLeft, ChevronLeft, ChevronRight, BookOpen, Trash2 } from "lucide-react"

// Interfaces para los datos de la base de datos
interface ClaseProgramadaDB {
  id: number
  fecha: string
  hora: string
  id_clase: number
  tipo_clase: string
  color: string
  id_instructor: number
  instructor_nombre: string
  capacidad_maxima: number
  participantes_actuales: number  // Calculado dinámicamente desde reservas
  plazas_libres: number          // Calculado dinámicamente
  estado: string
  created_at: string
  updated_at: string
  descripcion?: string           // Campo opcional del backend
  duracion_minutos?: number      // Campo opcional del backend
}

// Interface para el formato del calendario
interface ClaseCalendario {
  id: number
  tipo: string
  color: string
  hora: string
  duracion: number
  participantes: number
  maxParticipantes: number
  dia: number
  instructor: string
  fecha: string
}



const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

export default function CalendarioClasesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [semanaActual, setSemanaActual] = useState(new Date())
  const [clasesProgramadas, setClasesProgramadas] = useState<ClaseProgramadaDB[]>([])
  const [clasesCalendario, setClasesCalendario] = useState<ClaseCalendario[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const toast = useToast()



  // Función para cargar clases programadas desde la API
  const cargarClasesProgramadas = async () => {
    try {
      const timestamp = new Date().getTime()
      console.log(`[${timestamp}] Cargando clases programadas para calendario...`)
      
      const response = await fetch(`/api/clases-programadas?_t=${timestamp}&filter_future=false`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })

      if (!response.ok) {
        throw new Error(`Error al cargar clases programadas: ${response.status}`)
      }

      const data: ClaseProgramadaDB[] = await response.json()
      console.log(`[${timestamp}] Clases programadas cargadas:`, data.length)
      setClasesProgramadas(data)
      
    } catch (error) {
      console.error('Error al cargar clases programadas:', error)
      setClasesProgramadas([])
      toast({ title: 'Error al cargar clases', description: String(error), type: 'error' })
    }
  }

  // Función para obtener duración estimada por tipo de clase
  const obtenerDuracionPorTipo = (tipo: string): number => {
    // Intentar obtener la duración desde el campo `duracion_minutos` que
    // viene del JOIN con `gym_clases` en el endpoint `/clases-programadas`.
    // Buscamos una muestra en `clasesProgramadas` que coincida con el tipo
    // y tenga el valor disponible. Si no lo encontramos, se usa el
    // valor por defecto de 45 minutos.
    try {
      const ejemplo = clasesProgramadas.find(c => c.tipo_clase === tipo && c.duracion_minutos != null)
      if (ejemplo && typeof ejemplo.duracion_minutos === 'number') {
        return ejemplo.duracion_minutos
      }
    } catch (e) {
      // En caso de cualquier fallo, caemos al valor por defecto
      console.warn('obtenerDuracionPorTipo: error buscando duracion en clasesProgramadas', e)
    }
    return 45
  }

  // Función para convertir datos de BD al formato del calendario
  const convertirAFormatoCalendario = (clasesBD: ClaseProgramadaDB[], fechasSemana: Date[]): ClaseCalendario[] => {
    return clasesBD
      .filter(clase => clase.estado === 'activa' || clase.estado === 'programada') // Solo clases programadas o activas
      .map(clase => {
        // Encontrar el día de la semana (0=Lunes, 6=Domingo)
        const fechaClase = new Date(clase.fecha)
        const diaEncontrado = fechasSemana.findIndex(fecha => 
          fecha.toDateString() === fechaClase.toDateString()
        )
        
        return {
          id: clase.id,
          tipo: clase.tipo_clase,
          color: clase.color,
          hora: clase.hora,
          duracion: obtenerDuracionPorTipo(clase.tipo_clase),
          participantes: clase.participantes_actuales,
          maxParticipantes: clase.capacidad_maxima,
          dia: diaEncontrado >= 0 ? diaEncontrado : -1, // -1 si no está en la semana actual
          instructor: clase.instructor_nombre,
          fecha: clase.fecha
        }
      })
      .filter(clase => clase.dia >= 0) // Solo clases de la semana actual
  }

  // Función para obtener las fechas de la semana
  const obtenerFechasSemana = (fecha: Date) => {
    const fechas = []
    const inicioSemana = new Date(fecha)
    const dia = inicioSemana.getDay()
    const diff = inicioSemana.getDate() - dia + (dia === 0 ? -6 : 1) // Ajustar para que lunes sea el primer día
    inicioSemana.setDate(diff)

    for (let i = 0; i < 7; i++) {
      const fechaDia = new Date(inicioSemana)
      fechaDia.setDate(inicioSemana.getDate() + i)
      fechas.push(fechaDia)
    }
    return fechas
  }

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/")
      return
    }
    
    // Cargar datos al inicio
    const inicializarDatos = async () => {
      await cargarClasesProgramadas()
      setIsLoading(false)
    }
    
    inicializarDatos()
  }, [user, router])

  // Actualizar calendario cuando cambien las clases o la semana
  useEffect(() => {
    const fechasSemana = obtenerFechasSemana(semanaActual)
    const clasesConvertidas = convertirAFormatoCalendario(clasesProgramadas, fechasSemana)
    setClasesCalendario(clasesConvertidas)
  }, [clasesProgramadas, semanaActual])

  if (!user || user.role !== "admin") {
    return null
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando calendario...</div>
      </div>
    )
  }

  const fechasSemana = obtenerFechasSemana(semanaActual)

  const cambiarSemana = (direccion: number) => {
    const nuevaFecha = new Date(semanaActual)
    nuevaFecha.setDate(semanaActual.getDate() + direccion * 7)
    setSemanaActual(nuevaFecha)
  }

  const obtenerClasesPorDia = (dia: number) => {
    // Devolver las clases del día ordenadas por hora (ascendente)
    const clasesDia = clasesCalendario.filter((clase) => clase.dia === dia)
    const toMinutes = (hora: string) => {
      if (!hora) return 0
      const parts = String(hora).trim().split(":")
      const hh = Number(parts[0]) || 0
      const mm = Number(parts[1]) || 0
      return hh * 60 + mm
    }
    return clasesDia.sort((a, b) => toMinutes(a.hora) - toMinutes(b.hora))
  }

  const eliminarClase = async (id: number, tipo: string, fecha: string, hora: string) => {
    // Formatear la fecha para mejor legibilidad
    const fechaFormateada = new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    // Mostrar confirmación mediante toast con acción
    toast({
      title: 'Confirmar eliminación',
      description: `¿Eliminar la clase ${tipo} del ${fechaFormateada} a las ${hora}? Esta acción no se puede deshacer.`,
      type: 'info',
      actions: [
        {
          label: 'Eliminar',
          onClick: async () => {
            try {
              const timestamp = new Date().getTime()
              console.log(`[${timestamp}] Eliminando clase ID: ${id}`)

              const response = await fetch(`/api/clases-programadas/${id}?_t=${timestamp}`, {
                method: 'DELETE',
                headers: {
                  'Cache-Control': 'no-cache, no-store, must-revalidate',
                  'Pragma': 'no-cache',
                  'Expires': '0'
                }
              })

              const resultado = await response.json()

              if (!response.ok) {
                throw new Error(resultado.detail || 'Error al eliminar la clase')
              }

              console.log(`[${timestamp}] Clase eliminada:`, resultado)
              // Mostrar mensaje de éxito
              toast({ title: 'Clase eliminada', description: `La clase de ${tipo} del ${fechaFormateada} a las ${hora} ha sido eliminada correctamente.`, type: 'success' })
              // Recargar las clases para actualizar el calendario
              await cargarClasesProgramadas()
            } catch (error) {
              console.error('Error al eliminar clase:', error)
              toast({ title: 'Error al eliminar clase', description: String(error), type: 'error' })
            }
          }
        },
        { label: 'Cancelar' }
      ]
    })
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-full">
                <Calendar className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Calendario de Clases</h1>
                <p className="text-white/90">Gestión semanal de clases grupales</p>
              </div>
            </div>
            <Button
              onClick={() => router.push("/admin")}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>

        {/* Navegación de semana */}
        <Card className="bg-card border-border shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <Button onClick={() => cambiarSemana(-1)} variant="outline" className="flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" />
                Semana Anterior
              </Button>

              <div className="text-center">
                <h2 className="text-xl font-semibold">
                  {fechasSemana[0].toLocaleDateString("es-ES", { day: "numeric", month: "long" })} -{" "}
                  {fechasSemana[6].toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                </h2>
              </div>

              <Button onClick={() => cambiarSemana(1)} variant="outline" className="flex items-center gap-2">
                Semana Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Calendario semanal */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {diasSemana.map((dia, index) => {
            const clasesDia = obtenerClasesPorDia(index)
            const fechaDia = fechasSemana[index]

            return (
              <Card key={dia} className="bg-card border-border shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-center">
                    <div className="text-lg font-semibold">{dia}</div>
                    <div className="text-sm text-muted-foreground">
                      {fechaDia.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {clasesDia.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Sin clases programadas</p>
                    </div>
                  ) : (
                    clasesDia.map((clase) => (
                      <div key={clase.id} className={`relative p-3 rounded-lg border-2 ${clase.color}`}>
                        <div className="font-semibold text-sm mb-1">{clase.tipo}</div>
                        <div className="flex items-center gap-1 text-xs mb-1">
                          <Clock className="h-3 w-3" />
                          {clase.hora} ({clase.duracion}min)
                        </div>
                        <div className="flex items-center gap-1 text-xs mb-1">
                          <Users className="h-3 w-3" />
                          {clase.participantes}/{clase.maxParticipantes}
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <BookOpen className="h-3 w-3" />
                          {clase.instructor}
                        </div>
                        
                        {/* Botón de eliminar en la esquina inferior derecha (solo para clases futuras) */}
                        {(() => {
                          try {
                            const fechaHoraStr = `${clase.fecha}T${clase.hora}` // esperar ISO-like
                            const fechaClase = new Date(fechaHoraStr)
                            const ahora = new Date()
                            if (fechaClase > ahora) {
                              return (
                                <button
                                  onClick={() => eliminarClase(clase.id, clase.tipo, clase.fecha, clase.hora)}
                                  className="absolute bottom-0 right-0 p-0.5 hover:bg-red-100/50 rounded-tl transition-all duration-200 group"
                                  title="Eliminar clase"
                                >
                                  <Trash2 className="h-3 w-3 text-red-500 group-hover:text-red-700" />
                                </button>
                              )
                            }
                          } catch (e) {
                            // En caso de parseo fallido, por seguridad no mostramos el botón
                            console.warn('Error parseando fecha de clase para mostrar botón eliminar:', e)
                          }
                          return null
                        })()}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-full">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Clases</p>
                  <p className="text-xl font-bold text-primary">{clasesCalendario.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-full">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Participantes</p>
                  <p className="text-xl font-bold text-primary">
                    {clasesCalendario.reduce((total, clase) => total + clase.participantes, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-full">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Horas Totales</p>
                  <p className="text-xl font-bold text-primary">
                    {Math.round(clasesCalendario.reduce((total, clase) => total + clase.duracion, 0) / 60)}h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-full">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ocupación</p>
                  <p className="text-xl font-bold text-primary">
                    {clasesCalendario.length > 0 ? Math.round(
                      (clasesCalendario.reduce((total, clase) => total + clase.participantes, 0) /
                        clasesCalendario.reduce((total, clase) => total + clase.maxParticipantes, 0)) *
                        100,
                    ) : 0}
                    %
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
