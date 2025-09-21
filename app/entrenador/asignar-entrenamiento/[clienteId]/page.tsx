"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, Users, Plus, Save, ArrowLeft, Trash2 } from "lucide-react"

interface Cliente {
  id: number
  name: string
  email: string
  lastActivity: string
  totalWorkouts: number
  status: "activo" | "inactivo"
  avatar?: string
}

interface Entrenamiento {
  id: string
  fecha: string
  ejercicio: string
  series: number
}

export default function AsignarEntrenamientoPage() {
  const { user, isTrainer, isAuthenticated } = useAuth()
  const router = useRouter()
  const params = useParams()
  const clienteId = Number.parseInt(params.clienteId as string)

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [entrenamientos, setEntrenamientos] = useState<Entrenamiento[]>([])
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

  const ejerciciosDisponibles = [
    "Press de banca",
    "Sentadillas",
    "Peso muerto",
    "Press militar",
    "Remo con barra",
    "Dominadas",
    "Fondos",
    "Curl de bíceps",
    "Extensiones de tríceps",
    "Elevaciones laterales",
    "Prensa de piernas",
    "Curl femoral",
    "Extensiones de cuádriceps",
    "Caminadora",
    "Bicicleta estática",
    "Elíptica",
  ]

  useEffect(() => {
    console.log("[v0] Asignar entrenamiento a cliente:", clienteId)

    if (!isAuthenticated) {
      router.push("/")
      return
    }

    if (!isTrainer()) {
      router.push("/")
      return
    }

    const clientesSimulados: Cliente[] = [
      {
        id: 1,
        name: "Ana García",
        email: "ana.garcia@email.com",
        lastActivity: "2024-01-15",
        totalWorkouts: 24,
        status: "activo",
      },
      {
        id: 2,
        name: "Carlos López",
        email: "carlos.lopez@email.com",
        lastActivity: "2024-01-10",
        totalWorkouts: 18,
        status: "activo",
      },
      {
        id: 3,
        name: "María Rodríguez",
        email: "maria.rodriguez@email.com",
        lastActivity: "2023-12-28",
        totalWorkouts: 8,
        status: "inactivo",
      },
      {
        id: 4,
        name: "David Martín",
        email: "david.martin@email.com",
        lastActivity: "2024-01-14",
        totalWorkouts: 31,
        status: "activo",
      },
    ]

    const clienteEncontrado = clientesSimulados.find((c) => c.id === clienteId)
    setCliente(clienteEncontrado || null)

    setEntrenamientos([
      {
        id: Date.now().toString(),
        fecha: "",
        ejercicio: "",
        series: 0,
      },
    ])

    setIsLoading(false)
  }, [isAuthenticated, isTrainer, router, clienteId, nextWeekDates]) // nextWeekDates is now stable

  const agregarEntrenamiento = () => {
    const nuevoEntrenamiento: Entrenamiento = {
      id: Date.now().toString(),
      fecha: "",
      ejercicio: "",
      series: 0,
    }
    setEntrenamientos([...entrenamientos, nuevoEntrenamiento])
  }

  const eliminarEntrenamiento = (id: string) => {
    setEntrenamientos(entrenamientos.filter((e) => e.id !== id))
  }

  const actualizarEntrenamiento = (id: string, campo: keyof Entrenamiento, valor: string | number) => {
    setEntrenamientos(entrenamientos.map((e) => (e.id === id ? { ...e, [campo]: valor } : e)))
  }

  const guardarEntrenamientos = () => {
    console.log("[v0] Guardando entrenamientos:", entrenamientos)
    // TODO: Implementar guardado en backend
    router.push("/entrenador")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cliente no encontrado</div>
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
                <Avatar className="h-16 w-16 border-4 border-white/20">
                  <AvatarImage src={cliente.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold text-xl">
                    {cliente.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl font-bold text-white">Asignar Entrenamiento</CardTitle>
                  <p className="text-orange-100">{cliente.name}</p>
                  <p className="text-sm text-orange-200">{cliente.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                onClick={() => router.push("/entrenador")}
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
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{cliente.totalWorkouts}</p>
                  <p className="text-sm text-muted-foreground">Entrenamientos totales</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="p-2 bg-primary rounded-full">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{cliente.status}</p>
                  <p className="text-sm text-muted-foreground">Estado actual</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="p-2 bg-primary rounded-full">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{cliente.lastActivity}</p>
                  <p className="text-sm text-muted-foreground">Última actividad</p>
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
                <span>Plan de Entrenamiento</span>
              </CardTitle>
              <Button onClick={agregarEntrenamiento} className="bg-primary hover:bg-primary/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Ejercicio
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="col-span-4 font-semibold text-foreground">Fecha</div>
                <div className="col-span-5 font-semibold text-foreground">Ejercicio</div>
                <div className="col-span-2 font-semibold text-foreground">Series</div>
                <div className="col-span-1 font-semibold text-foreground">Acción</div>
              </div>

              {entrenamientos.map((entrenamiento) => (
                <div
                  key={entrenamiento.id}
                  className="grid grid-cols-12 gap-4 p-4 border border-border rounded-lg bg-card hover:border-primary/50 transition-all duration-200"
                >
                  <div className="col-span-4">
                    <Select
                      value={entrenamiento.fecha}
                      onValueChange={(value) => actualizarEntrenamiento(entrenamiento.id, "fecha", value)}
                    >
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue placeholder="Seleccionar fecha" />
                      </SelectTrigger>
                      <SelectContent>
                        {nextWeekDates.map((fecha) => (
                          <SelectItem key={fecha} value={fecha}>
                            {new Date(fecha).toLocaleDateString("es-ES", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-5">
                    <Select
                      value={entrenamiento.ejercicio}
                      onValueChange={(value) => actualizarEntrenamiento(entrenamiento.id, "ejercicio", value)}
                    >
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue placeholder="Seleccionar ejercicio" />
                      </SelectTrigger>
                      <SelectContent>
                        {ejerciciosDisponibles.map((ejercicio) => (
                          <SelectItem key={ejercicio} value={ejercicio}>
                            {ejercicio}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Select
                      value={entrenamiento.series === 0 ? "" : entrenamiento.series.toString()}
                      onValueChange={(value) =>
                        actualizarEntrenamiento(entrenamiento.id, "series", Number.parseInt(value))
                      }
                    >
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue placeholder="Seleccionar series" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4].map((serie) => (
                          <SelectItem key={serie} value={serie.toString()}>
                            {serie} serie{serie > 1 ? "s" : ""}
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
                      onClick={() => eliminarEntrenamiento(entrenamiento.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={guardarEntrenamientos} className="bg-primary hover:bg-primary/90 text-white">
                <Save className="h-4 w-4 mr-2" />
                Guardar Plan de Entrenamiento
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
