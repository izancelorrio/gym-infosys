"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Activity, Plus, Save, ArrowLeft, Trash2 } from "lucide-react"

interface ClaseProgramada {
  id: string
  fecha: string
  hora: string
  tipoClase: string
  instructor: string
}

interface GymClase {
  id: number
  nombre: string
  descripcion: string
  duracion_minutos: number
  nivel: string
  max_participantes: number
  created_at: string
  updated_at: string
}

export default function ProgramarClasePage() {
  const { user, isAdmin, isAuthenticated } = useAuth()
  const router = useRouter()

  const [clases, setClases] = useState<ClaseProgramada[]>([])
  const [tiposDeClase, setTiposDeClase] = useState<GymClase[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const nextWeekDates = useMemo(() => {
    const dates = []
    const today = new Date()

    // Encontrar el próximo lunes
    const daysUntilNextMonday = (8 - today.getDay()) % 7 || 7
    const nextMonday = new Date(today.getTime() + daysUntilNextMonday * 24 * 60 * 60 * 1000)

    // Generar los 7 días de la semana empezando desde el lunes
    for (let i = 0; i < 7; i++) {
      const date = new Date(nextMonday.getTime() + i * 24 * 60 * 60 * 1000)
      dates.push(date.toISOString().split("T")[0])
    }
    return dates
  }, [])



  const instructoresDisponibles = [
    "Ana García",
    "Carlos López", 
    "María Rodríguez",
    "José Martín",
    "Laura Fernández",
    "David Ruiz",
    "Carmen Silva",
    "Miguel Torres",
    "Elena Moreno",
    "Pablo Jiménez"
  ]

  const horariosDisponibles = [
    "06:00",
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
  ]

  const cargarTiposDeClase = async () => {
    try {
      const timestamp = new Date().getTime()
      console.log(`[${timestamp}] Cargando tipos de clase...`)
      
      const response = await fetch(`/api/gym-clases?_t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })

      if (!response.ok) {
        throw new Error(`Error al cargar tipos de clase: ${response.status}`)
      }

      const data = await response.json()
      console.log(`[${timestamp}] Tipos de clase cargados:`, data.length)
      setTiposDeClase(data)
      
    } catch (error) {
      console.error('Error al cargar tipos de clase:', error)
      // En caso de error, mantener array vacío 
      setTiposDeClase([])
    }
  }

  useEffect(() => {
    console.log("[v0] Programar clase - Admin:", user?.name)

    if (!isAuthenticated) {
      router.push("/")
      return
    }

    if (!isAdmin()) {
      router.push("/")
      return
    }

    const inicializarDatos = async () => {
      // Cargar tipos de clase desde la base de datos
      await cargarTiposDeClase()
      
      // Inicializar con una clase vacía
      setClases([
        {
          id: Date.now().toString(),
          fecha: "",
          hora: "",
          tipoClase: "",
          instructor: "",
        },
      ])

      setIsLoading(false)
    }

    inicializarDatos()
  }, [isAuthenticated, isAdmin, router, user])

  const agregarClase = () => {
    const nuevaClase: ClaseProgramada = {
      id: Date.now().toString(),
      fecha: "",
      hora: "",
      tipoClase: "",
      instructor: "",
    }
    setClases([...clases, nuevaClase])
  }

  const eliminarClase = (id: string) => {
    setClases(clases.filter((c) => c.id !== id))
  }

  const actualizarClase = (id: string, campo: keyof ClaseProgramada, valor: string) => {
    setClases(clases.map((c) => (c.id === id ? { ...c, [campo]: valor } : c)))
  }

  const guardarClases = () => {
    console.log("[v0] Guardando clases programadas:", clases)
    // TODO: Implementar guardado en backend
    router.push("/admin")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <Card className="border-border shadow-lg bg-card">
          <CardHeader className="bg-gradient-to-r from-primary to-secondary text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-full">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-white">Programar Clases</CardTitle>
                  <p className="text-orange-100">Gestión del calendario de clases grupales</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                onClick={() => router.push("/admin")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="p-2 bg-primary rounded-full">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{clases.length}</p>
                  <p className="text-sm text-muted-foreground">Clases programadas</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="p-2 bg-primary rounded-full">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{tiposDeClase.length}</p>
                  <p className="text-sm text-muted-foreground">Tipos disponibles</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="p-2 bg-primary rounded-full">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">7</p>
                  <p className="text-sm text-muted-foreground">Días programables</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-lg bg-card">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2 text-foreground">
                <Activity className="h-5 w-5" />
                <span>Calendario de Clases</span>
              </CardTitle>
              <Button onClick={agregarClase} className="bg-primary hover:bg-primary/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Clase
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-13 gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="col-span-3 font-semibold text-foreground">Fecha</div>
                <div className="col-span-2 font-semibold text-foreground">Hora</div>
                <div className="col-span-3 font-semibold text-foreground">Tipo de Clase</div>
                <div className="col-span-4 font-semibold text-foreground">Instructor</div>
                <div className="col-span-1 font-semibold text-foreground">Acción</div>
              </div>

              {clases.map((clase) => (
                <div
                  key={clase.id}
                  className="grid grid-cols-13 gap-4 p-4 border border-border rounded-lg bg-card hover:border-primary/50 transition-all duration-200"
                >
                  <div className="col-span-3">
                    <Select value={clase.fecha} onValueChange={(value) => actualizarClase(clase.id, "fecha", value)}>
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue placeholder="Seleccionar fecha" />
                      </SelectTrigger>
                      <SelectContent>
                        {nextWeekDates.map((fecha) => (
                          <SelectItem key={fecha} value={fecha}>
                            {new Date(fecha).toLocaleDateString("es-ES", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Select value={clase.hora} onValueChange={(value) => actualizarClase(clase.id, "hora", value)}>
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue placeholder="Hora" />
                      </SelectTrigger>
                      <SelectContent>
                        {horariosDisponibles.map((hora) => (
                          <SelectItem key={hora} value={hora}>
                            {hora}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <Select
                      value={clase.tipoClase}
                      onValueChange={(value) => actualizarClase(clase.id, "tipoClase", value)}
                    >
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue placeholder="Tipo de clase" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposDeClase.map((tipo) => (
                          <SelectItem key={tipo.id} value={tipo.nombre}>
                            {tipo.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-4">
                    <Select
                      value={clase.instructor}
                      onValueChange={(value) => actualizarClase(clase.id, "instructor", value)}
                    >
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue placeholder="Seleccionar instructor" />
                      </SelectTrigger>
                      <SelectContent>
                        {instructoresDisponibles.map((instructor) => (
                          <SelectItem key={instructor} value={instructor}>
                            {instructor}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white bg-transparent"
                      onClick={() => eliminarClase(clase.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={guardarClases} className="bg-primary hover:bg-primary/90 text-white">
                <Save className="h-4 w-4 mr-2" />
                Guardar Calendario de Clases
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
