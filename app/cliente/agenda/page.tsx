"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users, ArrowLeft, ChevronLeft, ChevronRight, Dumbbell, BookOpen } from "lucide-react"

// Datos de ejemplo de clases reservadas por el cliente
const clasesReservadas = [
  {
    id: 1,
    tipo: "Pilates",
    hora: "09:00",
    duracion: 60,
    instructor: "Ana García",
    dia: 1
  },
  {
    id: 2,
    tipo: "CrossFit",
    hora: "18:00",
    duracion: 60,
    instructor: "Carlos López",
    dia: 3
  },
  {
    id: 3,
    tipo: "Yoga",
    hora: "19:30",
    duracion: 75,
    instructor: "María Rodríguez",
    dia: 5
  }
]

// Datos de ejemplo de ejercicios planificados por el entrenador
const ejerciciosPlanificados = [
  {
    id: 1,
    dia: 0,
    ejercicios: [
      { nombre: "Press de banca", series: 4 },
      { nombre: "Sentadillas", series: 3 },
      { nombre: "Remo con barra", series: 3 }
    ],
    entrenador: "José Martín"
  },
  {
    id: 2,
    dia: 2,
    ejercicios: [
      { nombre: "Peso muerto", series: 4 },
      { nombre: "Press militar", series: 3 },
      { nombre: "Dominadas", series: 3 }
    ],
    entrenador: "José Martín"
  },
  {
    id: 3,
    dia: 4,
    ejercicios: [
      { nombre: "Cardio HIIT", series: 1 },
      { nombre: "Plancha", series: 3 },
      { nombre: "Burpees", series: 4 }
    ],
    entrenador: "José Martín"
  }
]

const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

export default function AgendaClientePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [semanaActual, setSemanaActual] = useState(new Date())

  useEffect(() => {
    if (!user || user.role !== "cliente") {
      router.push("/")
    }
  }, [user, router])

  if (!user || user.role !== "cliente") {
    return null
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
    return clasesReservadas.filter((clase) => clase.dia === dia)
  }

  const obtenerEjerciciosPlanificadosPorDia = (dia: number) => {
    return ejerciciosPlanificados.filter((ejercicio) => ejercicio.dia === dia)
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
                  {clasesDelDia.map((clase) => (
                    <div
                      key={clase.id}
                      className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-blue-700 dark:text-blue-300">
                          {clase.tipo}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>{clase.hora} ({clase.duracion} min)</span>
                        </div>
                        <div>Instructor: {clase.instructor}</div>
                      </div>
                    </div>
                  ))}

                  {/* Ejercicios planificados */}
                  {ejerciciosDelDia.map((planificacion) => (
                    <div
                      key={planificacion.id}
                      className="p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Dumbbell className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-700 dark:text-green-300">
                          Entrenamiento
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        {planificacion.ejercicios.map((ejercicio, idx) => (
                          <div key={idx} className="text-muted-foreground">
                            <div className="font-medium">{ejercicio.nombre}</div>
                            <div className="text-xs">
                              {ejercicio.series} series
                            </div>
                          </div>
                        ))}
                        <div className="text-xs text-muted-foreground pt-2 border-t border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-3 w-3" />
                            Entrenador: {planificacion.entrenador}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

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
            <div className="w-4 h-4 rounded bg-blue-200 dark:bg-blue-800"></div>
            <span className="text-sm text-muted-foreground">Clases reservadas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-200 dark:bg-green-800"></div>
            <span className="text-sm text-muted-foreground">Ejercicios planificados</span>
          </div>
        </div>
      </div>
    </div>
  )
}