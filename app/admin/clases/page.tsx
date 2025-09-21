"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"

// Datos de ejemplo de clases programadas
const clasesEjemplo = [
  {
    id: 1,
    tipo: "Pilates",
    hora: "09:00",
    duracion: 60,
    participantes: 12,
    maxParticipantes: 15,
    dia: 0,
  },
  {
    id: 2,
    tipo: "Zumba",
    hora: "10:30",
    duracion: 45,
    participantes: 20,
    maxParticipantes: 25,
    dia: 0,
  },
  {
    id: 15,
    tipo: "CrossFit",
    hora: "16:00",
    duracion: 60,
    participantes: 10,
    maxParticipantes: 12,
    dia: 0,
  },
  {
    id: 16,
    tipo: "Spinning",
    hora: "18:30",
    duracion: 45,
    participantes: 18,
    maxParticipantes: 20,
    dia: 0,
  },
  {
    id: 3,
    tipo: "CrossFit",
    hora: "18:00",
    duracion: 60,
    participantes: 8,
    maxParticipantes: 12,
    dia: 1,
  },
  {
    id: 4,
    tipo: "Spinning",
    hora: "19:30",
    duracion: 45,
    participantes: 15,
    maxParticipantes: 20,
    dia: 1,
  },
  {
    id: 5,
    tipo: "Yoga",
    hora: "08:00",
    duracion: 75,
    participantes: 10,
    maxParticipantes: 15,
    dia: 2,
  },
  {
    id: 6,
    tipo: "Pilates",
    hora: "17:00",
    duracion: 60,
    participantes: 14,
    maxParticipantes: 15,
    dia: 2,
  },
  {
    id: 7,
    tipo: "CrossFit",
    hora: "07:00",
    duracion: 60,
    participantes: 6,
    maxParticipantes: 12,
    dia: 3,
  },
  {
    id: 8,
    tipo: "Zumba",
    hora: "19:00",
    duracion: 45,
    participantes: 18,
    maxParticipantes: 25,
    dia: 3,
  },
  {
    id: 9,
    tipo: "Spinning",
    hora: "18:30",
    duracion: 45,
    participantes: 12,
    maxParticipantes: 20,
    dia: 4,
  },
  {
    id: 10,
    tipo: "Yoga",
    hora: "20:00",
    duracion: 75,
    participantes: 8,
    maxParticipantes: 15,
    dia: 4,
  },
  {
    id: 11,
    tipo: "Pilates",
    hora: "10:00",
    duracion: 60,
    participantes: 11,
    maxParticipantes: 15,
    dia: 5,
  },
  {
    id: 12,
    tipo: "CrossFit",
    hora: "11:30",
    duracion: 60,
    participantes: 9,
    maxParticipantes: 12,
    dia: 5,
  },
  {
    id: 13,
    tipo: "Zumba",
    hora: "12:00",
    duracion: 45,
    participantes: 22,
    maxParticipantes: 25,
    dia: 6,
  },
  {
    id: 14,
    tipo: "Yoga",
    hora: "17:30",
    duracion: 75,
    participantes: 13,
    maxParticipantes: 15,
    dia: 6,
  },
]

const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

export default function CalendarioClasesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [semanaActual, setSemanaActual] = useState(new Date())

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/")
    }
  }, [user, router])

  if (!user || user.role !== "admin") {
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

  const obtenerClasesPorDia = (dia: number) => {
    return clasesEjemplo.filter((clase) => clase.dia === dia)
  }

  const getColorClase = (tipo: string) => {
    const colores: { [key: string]: string } = {
      Pilates: "bg-blue-100 border-blue-300 text-blue-800",
      Zumba: "bg-pink-100 border-pink-300 text-pink-800",
      CrossFit: "bg-red-100 border-red-300 text-red-800",
      Spinning: "bg-green-100 border-green-300 text-green-800",
      Yoga: "bg-purple-100 border-purple-300 text-purple-800",
    }
    return colores[tipo] || "bg-gray-100 border-gray-300 text-gray-800"
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
                      <div key={clase.id} className={`p-3 rounded-lg border-2 ${getColorClase(clase.tipo)}`}>
                        <div className="font-semibold text-sm mb-1">{clase.tipo}</div>
                        <div className="flex items-center gap-1 text-xs mb-1">
                          <Clock className="h-3 w-3" />
                          {clase.hora} ({clase.duracion}min)
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Users className="h-3 w-3" />
                          {clase.participantes}/{clase.maxParticipantes}
                        </div>
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
                  <p className="text-xl font-bold text-primary">{clasesEjemplo.length}</p>
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
                    {clasesEjemplo.reduce((total, clase) => total + clase.participantes, 0)}
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
                    {Math.round(clasesEjemplo.reduce((total, clase) => total + clase.duracion, 0) / 60)}h
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
                    {Math.round(
                      (clasesEjemplo.reduce((total, clase) => total + clase.participantes, 0) /
                        clasesEjemplo.reduce((total, clase) => total + clase.maxParticipantes, 0)) *
                        100,
                    )}
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
