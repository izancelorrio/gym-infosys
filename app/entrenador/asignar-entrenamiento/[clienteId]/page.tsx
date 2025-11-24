"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import { API_CONFIG } from "@/lib/config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
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

interface Ejercicio {
  id: number
  nombre: string
  categoria: string
  descripcion: string
}

export default function AsignarEntrenamientoPage() {
  const { user, isTrainer, isAuthenticated } = useAuth()
  const router = useRouter()
  const params = useParams()
  const clienteId = Number.parseInt(params.clienteId as string)

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [entrenamientos, setEntrenamientos] = useState<Entrenamiento[]>([])
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const toast = useToast()

  const availableDates = useMemo(() => {
    const dates = []
    const today = new Date()

    // Generar 15 días a partir de hoy
    for (let i = 0; i < 15; i++) {
      const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000)
      dates.push(date.toISOString().split("T")[0])
    }
    return dates
  }, [])



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

    const fetchData = async () => {
      try {
        // Obtener datos del entrenador y sus clientes
  const clientesResponse = await fetch(`${API_CONFIG.BASE_URL}/entrenador/${user?.id}/clientes`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!clientesResponse.ok) {
          throw new Error(`Error HTTP al obtener clientes: ${clientesResponse.status}`)
        }

        const clientesData = await clientesResponse.json()
        console.log("[DEBUG] Datos de clientes del entrenador:", clientesData)

        if (clientesData.success && clientesData.clientes) {
          // Buscar el cliente específico en la lista
          const clienteEncontrado = clientesData.clientes.find((c: any) => c.id === clienteId)
          
          if (clienteEncontrado) {
            const clienteFormateado: Cliente = {
              id: clienteEncontrado.id,
              name: clienteEncontrado.name,
              email: clienteEncontrado.email,
              lastActivity: clienteEncontrado.last_activity || clienteEncontrado.fecha_inscripcion,
              totalWorkouts: clienteEncontrado.total_workouts || 0,
              status: clienteEncontrado.status === "activo" ? "activo" : "inactivo",
            }
            setCliente(clienteFormateado)
          } else {
            console.error("[ERROR] Cliente no encontrado en la lista del entrenador")
            setCliente(null)
          }
        } else {
          console.error("[ERROR] Respuesta inválida del servidor:", clientesData)
          setCliente(null)
        }

        // Obtener ejercicios disponibles
  const ejerciciosResponse = await fetch(`${API_CONFIG.BASE_URL}/ejercicios`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!ejerciciosResponse.ok) {
          throw new Error(`Error HTTP al obtener ejercicios: ${ejerciciosResponse.status}`)
        }

        const ejerciciosData = await ejerciciosResponse.json()
        console.log("[DEBUG] Datos de ejercicios:", ejerciciosData)

        if (ejerciciosData.success && ejerciciosData.ejercicios) {
          setEjercicios(ejerciciosData.ejercicios)
        } else {
          console.error("[ERROR] Respuesta inválida del servidor para ejercicios:", ejerciciosData)
          setEjercicios([])
        }

      } catch (error) {
        console.error("[ERROR] Error al obtener datos:", error)
        setCliente(null)
        setEjercicios([])
      } finally {
        setIsLoading(false)
      }
    }

    // Inicializar entrenamientos
    setEntrenamientos([
      {
        id: Date.now().toString(),
        fecha: "",
        ejercicio: "",
        series: 0,
      },
    ])

    fetchData()
  }, [isAuthenticated, isTrainer, router, clienteId, user?.id]) // nextWeekDates is now stable

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

  const guardarEntrenamientos = async () => {
    try {
      // Validar que todos los entrenamientos tengan datos completos
      const entrenamientosCompletos = entrenamientos.filter(e => 
        e.fecha && e.ejercicio && e.series > 0
      )

      if (entrenamientosCompletos.length === 0) {
        toast({ title: 'Atención', description: 'Por favor, completa al menos un entrenamiento con fecha, ejercicio y series', type: 'info' })
        return
      }

      console.log("[DEBUG] Guardando entrenamientos:", entrenamientosCompletos)

  const response = await fetch(`${API_CONFIG.BASE_URL}/entrenador/${user?.id}/cliente/${clienteId}/plan-entrenamiento`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entrenamientos: entrenamientosCompletos
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `Error HTTP: ${response.status}`)
      }

      const data = await response.json()
      console.log("[DEBUG] Respuesta del servidor:", data)

      if (data.success) {
        toast({ title: 'Plan guardado', description: `${data.total} entrenamientos asignados.`, type: 'success' })
        router.push("/entrenador")
      } else {
        throw new Error(data.message || "Error al guardar el plan")
      }

    } catch (error) {
      console.error("[ERROR] Error al guardar entrenamientos:", error)
      toast({ title: 'Error', description: String(error instanceof Error ? error.message : 'Error desconocido'), type: 'error' })
    }
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
                        {availableDates.map((fecha: string) => (
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
                        {ejercicios.map((ejercicio: Ejercicio) => (
                          <SelectItem key={ejercicio.id} value={ejercicio.nombre}>
                            {ejercicio.nombre}
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
