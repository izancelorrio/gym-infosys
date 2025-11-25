"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { API_CONFIG } from "@/lib/config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users, ArrowLeft, ChevronLeft, ChevronRight, Dumbbell, BookOpen } from "lucide-react"

// State will hold real data fetched from the API

const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

export default function AgendaClientePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [semanaActual, setSemanaActual] = useState(new Date())
  const [clasesReservadas, setClasesReservadas] = useState<any[]>([])
  const [clasesCompletadas, setClasesCompletadas] = useState<any[]>([])
  const [ejerciciosPlanificados, setEjerciciosPlanificados] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== "cliente") {
      router.push("/")
    }
  }, [user, router])

  // Cargar datos reales: reservas y entrenamientos pendientes (y opcionalmente realizados)
  useEffect(() => {
    const cargarDatos = async () => {
      if (!user || user.role !== 'cliente') return
      setIsLoading(true)

      try {
        // 1) Reservas (usamos la ruta interna /api/reservas que espera cliente_id)
        const clienteId = user?.cliente?.id
        if (clienteId) {
          const resReservas = await fetch(`/api/reservas?cliente_id=${clienteId}`)
          if (resReservas.ok) {
            const data = await resReservas.json()
            // data is expected to be an array of reservas
            const reservasArray = Array.isArray(data) ? data : []
            // Separar activas vs completadas
            const activas = reservasArray.filter((r: any) => r.estado === 'activa')
            const completadas = reservasArray.filter((r: any) => r.estado !== 'activa')
            setClasesReservadas(activas)
            setClasesCompletadas(completadas)
          } else {
            console.error('Error al obtener reservas', resReservas.status)
          }
        } else {
          console.warn('Cliente id no disponible en user.cliente, intentando user.id para reservas')
          // Fallback: intentar obtener por user.id vía backend directo
          try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/user/${user.id}/reservas`)
            if (res.ok) {
              const data = await res.json()
              const reservasArray = Array.isArray(data) ? data : []
              const activas = reservasArray.filter((r: any) => r.estado === 'activa')
              const completadas = reservasArray.filter((r: any) => r.estado !== 'activa')
              setClasesReservadas(activas)
              setClasesCompletadas(completadas)
            }
          } catch (e) {
            console.error('Fallback reservas error', e)
          }
        }

        // 2) Entrenamientos asignados (todos los estados) - usamos nuevo endpoint
        try {
          const resEntr = await fetch(`${API_CONFIG.BASE_URL}/cliente/${user.id}/entrenamientos-asignados`)
          if (resEntr.ok) {
            const json = await resEntr.json()
            if (json && json.success) {
              // Guardamos los entrenamientos asignados (incluye estado: pendiente/completado)
              setEjerciciosPlanificados(json.entrenamientos_asignados || [])
            } else if (Array.isArray(json)) {
              setEjerciciosPlanificados(json)
            }
          } else {
            console.error('Error al cargar entrenamientos asignados', resEntr.status)
          }
        } catch (e) {
          console.error('Error fetch entrenamientos asignados', e)
        }

        // Nota: no solicitamos "entrenamientos-realizados" aquí para evitar 404 en servidores

      } catch (error) {
        console.error('Error cargando datos de agenda:', error)
      } finally {
        setIsLoading(false)
      }
    }

    cargarDatos()
  }, [user])

  if (!user || user.role !== "cliente") {
    return null
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando agenda...</div>
      </div>
    )
  }

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

  const fechasSemana = obtenerFechasSemana(semanaActual)

  const cambiarSemana = (direccion: number) => {
    const nuevaFecha = new Date(semanaActual)
    nuevaFecha.setDate(semanaActual.getDate() + direccion * 7)
    setSemanaActual(nuevaFecha)
  }

  const obtenerClasesReservadasPorDia = (dia: number) => {
    // Filtrar por la fecha concreta de la semana seleccionada
    const targetDate = fechasSemana[dia]
    const targetStr = targetDate.toISOString().split('T')[0]
    return clasesReservadas.filter((reserva) => {
      try {
        const raw = reserva.clase?.fecha || reserva.fecha || reserva.fecha_entrenamiento
        if (!raw) return false
        const fecha = new Date(raw)
        const fechaStr = fecha.toISOString().split('T')[0]
        return fechaStr === targetStr
      } catch (e) {
        return false
      }
    })
  }

  const obtenerClasesCompletadasPorDia = (dia: number) => {
    const targetDate = fechasSemana[dia]
    const targetStr = targetDate.toISOString().split('T')[0]
    return clasesCompletadas.filter((reserva) => {
      try {
        const raw = reserva.clase?.fecha || reserva.fecha || reserva.fecha_entrenamiento
        if (!raw) return false
        const fecha = new Date(raw)
        const fechaStr = fecha.toISOString().split('T')[0]
        return fechaStr === targetStr
      } catch (e) {
        return false
      }
    })
  }

  const obtenerEjerciciosPlanificadosPorDia = (dia: number) => {
    const targetDate = fechasSemana[dia]
    const targetStr = targetDate.toISOString().split('T')[0]
    return ejerciciosPlanificados.filter((plan) => {
      try {
        const raw = plan.fecha_entrenamiento || plan.fecha || plan.fecha_realizacion
        if (!raw) return false
        const fecha = new Date(raw)
        const fechaStr = fecha.toISOString().split('T')[0]
        return fechaStr === targetStr
      } catch (e) {
        return false
      }
    })
  }

  const formatearFecha = (fecha: Date) => {
    return fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit"
    })
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
                <h1 className="text-2xl font-bold text-white">Mi Agenda</h1>
                <p className="text-white/90">Revisa tus clases reservadas y ejercicios planificados</p>
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

        {/* Navegación de semanas */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => cambiarSemana(-1)}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Semana anterior
          </Button>
          
          <div className="text-center">
            <h2 className="text-xl font-semibold">
              {fechasSemana[0].toLocaleDateString("es-ES", { day: "2-digit", month: "long" })} - {" "}
              {fechasSemana[6].toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}
            </h2>
          </div>

          <Button
            variant="outline"
            onClick={() => cambiarSemana(1)}
            className="flex items-center gap-2"
          >
            Siguiente semana
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendario semanal */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {diasSemana.map((dia, index) => {
            const clasesDelDia = obtenerClasesReservadasPorDia(index)
            const ejerciciosDelDia = obtenerEjerciciosPlanificadosPorDia(index)
            const fechaDelDia = fechasSemana[index]
            const esHoy = fechaDelDia.toDateString() === new Date().toDateString()

            return (
              <Card key={dia} className={`min-h-[400px] ${esHoy ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{dia}</span>
                    <span className={`text-sm ${esHoy ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                      {formatearFecha(fechaDelDia)}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Clases reservadas */}
                  {clasesDelDia.map((reserva) => {
                    const clase = reserva.clase || {}
                    const hora = clase.hora || reserva.hora || ''
                    const duracion = clase.duracion || reserva.duracion || ''
                    const tipo = clase.tipo || reserva.tipo || 'Clase'
                    const instructor = clase.instructor || reserva.instructor || ''
                    return (
                      <div
                        key={reserva.id}
                        className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950 border-2 border-amber-400"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4 text-amber-600" />
                          <span className="font-semibold text-amber-700 dark:text-amber-300">
                            {tipo}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span>{hora} {duracion ? `(${duracion} min)` : ''}</span>
                          </div>
                          <div>Instructor: {instructor}</div>
                        </div>
                      </div>
                    )
                  })}

                      {/* Clases completadas (muestra en estilo atenuado) */}
                      {obtenerClasesCompletadasPorDia(index).map((reserva) => {
                        const clase = reserva.clase || {}
                        const hora = clase.hora || reserva.hora || ''
                        const tipo = clase.tipo || reserva.tipo || 'Clase'
                        const instructor = clase.instructor || reserva.instructor || ''
                        return (
                          <div key={`comp-${reserva.id}`} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 opacity-70">
                            <div className="flex items-center gap-2 mb-2">
                              <Users className="h-4 w-4 text-gray-600" />
                              <span className="font-semibold text-gray-700 dark:text-gray-300">{tipo} (Completada)</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                <span>{hora}</span>
                              </div>
                              <div>Instructor: {instructor}</div>
                            </div>
                          </div>
                        )
                      })}

                  {/* Ejercicios planificados */}
                  {ejerciciosDelDia.map((planificacion) => {
                    const isCompletado = planificacion.estado === 'completado'
                    if (isCompletado) {
                      return (
                        <div key={planificacion.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 opacity-80">
                          <div className="flex items-center gap-2 mb-2">
                            <Dumbbell className="h-4 w-4 text-gray-600" />
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Entrenamiento (Completado)</span>
                          </div>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            {Array.isArray(planificacion.ejercicios)
                              ? planificacion.ejercicios.map((ejercicio: any, idx: number) => (
                                <div key={idx} className="text-muted-foreground">
                                  <div className="font-medium">{ejercicio.nombre}</div>
                                  <div className="text-xs">{ejercicio.series || ejercicio.series_planificadas} series</div>
                                </div>
                              ))
                              : (
                                <div className="text-muted-foreground">
                                  <div className="font-medium">{planificacion.ejercicio?.nombre || 'Entrenamiento'}</div>
                                  <div className="text-xs">{planificacion.series_planificadas || ''} series</div>
                                </div>
                              )}
                            <div className="text-xs text-muted-foreground pt-2 border-t border-gray-200 dark:border-gray-800">
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-3 w-3" />
                                Entrenador: {planificacion.entrenador || planificacion.entrenador_nombre}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div
                        key={planificacion.id}
                        className="p-3 rounded-lg bg-green-50 dark:bg-green-950 border-2 border-emerald-400"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Dumbbell className="h-4 w-4 text-emerald-600" />
                          <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                            Entrenamiento
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          {Array.isArray(planificacion.ejercicios)
                              ? planificacion.ejercicios.map((ejercicio: any, idx: number) => (
                                <div key={idx} className="text-muted-foreground">
                                  <div className="font-medium">{ejercicio.nombre}</div>
                                  <div className="text-xs">{ejercicio.series || ejercicio.series_planificadas} series</div>
                                </div>
                              ))
                            : (
                              <div className="text-muted-foreground">
                                <div className="font-medium">{planificacion.ejercicio?.nombre || 'Entrenamiento'}</div>
                                <div className="text-xs">{planificacion.series_planificadas || ''} series</div>
                              </div>
                            )}
                          <div className="text-xs text-muted-foreground pt-2 border-t border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-3 w-3" />
                              Entrenador: {planificacion.entrenador || planificacion.entrenador_nombre}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {clasesDelDia.length === 0 && ejerciciosDelDia.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No hay actividades programadas</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Leyenda */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-300 dark:bg-amber-800"></div>
            <span className="text-sm text-muted-foreground">Clases pendientes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-200 dark:bg-emerald-800"></div>
            <span className="text-sm text-muted-foreground">Entrenamientos pendientes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-800"></div>
            <span className="text-sm text-muted-foreground">Clases completadas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-800"></div>
            <span className="text-sm text-muted-foreground">Ejercicios completados</span>
          </div>
        </div>
      </div>
    </div>
  )
}