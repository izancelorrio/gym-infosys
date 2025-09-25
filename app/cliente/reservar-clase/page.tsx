"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, ArrowLeft, MapPin, User2, CheckCircle } from "lucide-react"

// Datos de ejemplo de clases disponibles con plazas libres
const clasesDisponibles = [
  {
    id: 1,
    tipo: "Pilates",
    instructor: "Ana García",
    fecha: "2025-09-26",
    hora: "09:00",
    duracion: 60,
    participantes: 12,
    maxParticipantes: 15,
    descripcion: "Clase de Pilates enfocada en el fortalecimiento del core y la mejora de la flexibilidad.",
    ubicacion: "Sala A",
    plazasLibres: 3
  },
  {
    id: 2,
    tipo: "CrossFit",
    instructor: "Carlos López",
    fecha: "2025-09-26",
    hora: "18:00",
    duracion: 60,
    participantes: 8,
    maxParticipantes: 12,
    descripcion: "Entrenamiento funcional de alta intensidad para mejorar fuerza y resistencia.",
    ubicacion: "Sala CrossFit",
    plazasLibres: 4
  },
  {
    id: 3,
    tipo: "Yoga",
    instructor: "María Rodríguez",
    fecha: "2025-09-27",
    hora: "08:00",
    duracion: 75,
    participantes: 10,
    maxParticipantes: 15,
    descripcion: "Sesión de Yoga Hatha para principiantes y nivel intermedio.",
    ubicacion: "Sala B",
    plazasLibres: 5
  },
  {
    id: 4,
    tipo: "Spinning",
    instructor: "David Ruiz",
    fecha: "2025-09-27",
    hora: "19:30",
    duracion: 45,
    participantes: 15,
    maxParticipantes: 20,
    descripcion: "Clase de spinning con música energética y diferentes niveles de intensidad.",
    ubicacion: "Sala Spinning",
    plazasLibres: 5
  },
  {
    id: 5,
    tipo: "Zumba",
    instructor: "Laura Fernández",
    fecha: "2025-09-28",
    hora: "10:30",
    duracion: 45,
    participantes: 18,
    maxParticipantes: 25,
    descripcion: "Baile fitness con ritmos latinos para quemar calorías divirtiéndote.",
    ubicacion: "Sala Principal",
    plazasLibres: 7
  },
  {
    id: 6,
    tipo: "CrossFit",
    instructor: "José Martín",
    fecha: "2025-09-28",
    hora: "07:00",
    duracion: 60,
    participantes: 6,
    maxParticipantes: 12,
    descripcion: "Sesión matutina de CrossFit para empezar el día con energía.",
    ubicacion: "Sala CrossFit",
    plazasLibres: 6
  },
  {
    id: 7,
    tipo: "Pilates",
    instructor: "Ana García",
    fecha: "2025-09-29",
    hora: "17:00",
    duracion: 60,
    participantes: 11,
    maxParticipantes: 15,
    descripcion: "Pilates avanzado con implementos y ejercicios de equilibrio.",
    ubicacion: "Sala A",
    plazasLibres: 4
  }
]

const tiposClase = ["Todos", "Pilates", "CrossFit", "Yoga", "Spinning", "Zumba"]

export default function ReservarClasePage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [filtroTipo, setFiltroTipo] = useState("Todos")
  const [clasesReservadas, setClasesReservadas] = useState<number[]>([])

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "cliente") {
      router.push("/")
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || user?.role !== "cliente") {
    return null
  }

  const clasesFiltradas = clasesDisponibles.filter(clase => 
    filtroTipo === "Todos" || clase.tipo === filtroTipo
  )

  const reservarClase = (claseId: number) => {
    setClasesReservadas([...clasesReservadas, claseId])
    // Aquí se implementaría la llamada a la API para reservar
    console.log(`Reservando clase ${claseId}`)
  }

  const formatearFecha = (fechaString: string) => {
    const fecha = new Date(fechaString)
    return fecha.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long"
    })
  }

  const getColorTipo = (tipo: string) => {
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
              {tiposClase.map((tipo) => (
                <Button
                  key={tipo}
                  variant={filtroTipo === tipo ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroTipo(tipo)}
                  className="mb-2"
                >
                  {tipo}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lista de clases */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clasesFiltradas.map((clase) => {
            const yaReservada = clasesReservadas.includes(clase.id)
            
            return (
              <Card key={clase.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getColorTipo(clase.tipo)}>
                      {clase.tipo}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {clase.plazasLibres} plazas libres
                    </div>
                  </div>
                  <CardTitle className="text-xl">{clase.tipo}</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {formatearFecha(clase.fecha)}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Información básica */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{clase.hora} - {clase.duracion} min</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User2 className="h-4 w-4 text-muted-foreground" />
                      <span>{clase.instructor}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{clase.ubicacion}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{clase.participantes}/{clase.maxParticipantes} participantes</span>
                    </div>
                  </div>

                  {/* Descripción */}
                  <div className="text-sm text-muted-foreground">
                    {clase.descripcion}
                  </div>

                  {/* Botón de reserva */}
                  <div className="pt-2">
                    {yaReservada ? (
                      <Button 
                        disabled 
                        className="w-full bg-green-600 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Reservada
                      </Button>
                    ) : clase.plazasLibres > 0 ? (
                      <Button
                        onClick={() => reservarClase(clase.id)}
                        className="w-full bg-primary hover:bg-primary/90"
                      >
                        Reservar Clase
                      </Button>
                    ) : (
                      <Button 
                        disabled 
                        variant="outline" 
                        className="w-full"
                      >
                        Sin plazas disponibles
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

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