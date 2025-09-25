"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, Users, Plus, Save, ArrowLeft, Trash2 } from "lucide-react"

interface Ejercicio {
  id: string
  fecha: string
  tipo?: "clase" | "fuerza" // Hacer opcional para permitir estado inicial sin tipo
  actividad: string
  // Campos para ejercicios de fuerza
  series?: number
  repeticiones?: number
  peso?: number
  // Campo para clases
  duracion?: number
}

export default function RegistrarEjercicioPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Generar fechas del último mes hasta hoy
  const fechasDisponibles = useMemo(() => {
    const fechas = []
    const hoy = new Date()
    
    // Generar fechas para el último mes
    for (let i = 0; i < 30; i++) {
      const fecha = new Date(hoy)
      fecha.setDate(hoy.getDate() - i)
      
      // Formato: dd/MM/yy
      const dia = fecha.getDate().toString().padStart(2, '0')
      const mes = (fecha.getMonth() + 1).toString().padStart(2, '0')
      const anio = fecha.getFullYear().toString().slice(-2)
      
      fechas.push({
        valor: `${fecha.getFullYear()}-${mes}-${dia}`, // Valor interno
        etiqueta: `${dia}/${mes}/${anio}` // Etiqueta visible
      })
    }
    
    return fechas
  }, [])

  const clasesDisponibles = [
    "Pilates",
    "Zumba", 
    "CrossFit",
    "Spinning",
    "Yoga",
    "Aeróbicos",
    "Funcional",
    "Boxing",
    "Aqua Aeróbicos",
    "Body Pump",
    "Body Combat",
    "Stretching"
  ]

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

  const duracionesClase = [30, 45, 60, 90] // en minutos
  const repeticionesDisponibles = [5, 6, 7, 8, 9, 10, 12, 15, 20]
  const pesosDisponibles = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 110, 120]

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }

    if (user?.role !== "cliente") {
      router.push("/")
      return
    }

    // Verificar si hay datos existentes en localStorage
    const ejerciciosGuardados = localStorage.getItem(`ejercicios-${user?.email}`)
    if (ejerciciosGuardados) {
      try {
        const ejerciciosCargados = JSON.parse(ejerciciosGuardados)
        console.log("Ejercicios cargados desde localStorage:", ejerciciosCargados)
        // Mostrar ejercicios existentes pero permitir agregar nuevos
      } catch (error) {
        console.error("Error al cargar ejercicios:", error)
      }
    }
    
    // Inicializar con un ejercicio vacío para empezar a registrar
    const hoy = new Date()
    const dia = hoy.getDate().toString().padStart(2, '0')
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0')
    const anio = hoy.getFullYear()

    setEjercicios([
      {
        id: Date.now().toString(),
        fecha: `${anio}-${mes}-${dia}`,
        actividad: "", // Sin tipo inicial para mostrar ambos dropdowns
      },
    ])

    setIsLoading(false)
  }, [isAuthenticated, router, user?.role, user?.email])

  const agregarEjercicio = () => {
    // Usar la fecha de hoy formateada
    const hoy = new Date()
    const dia = hoy.getDate().toString().padStart(2, '0')
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0')
    const anio = hoy.getFullYear()

    const nuevoEjercicio: Ejercicio = {
      id: Date.now().toString(),
      fecha: `${anio}-${mes}-${dia}`,
      actividad: "", // Sin tipo inicial para mostrar ambos dropdowns
    }
    setEjercicios([...ejercicios, nuevoEjercicio])
  }

  const eliminarEjercicio = (id: string) => {
    setEjercicios(ejercicios.filter((e) => e.id !== id))
  }

  const actualizarEjercicio = (id: string, campo: keyof Ejercicio, valor: any) => {
    setEjercicios(ejercicios.map((e) => (e.id === id ? { ...e, [campo]: valor } : e)))
  }

  const actualizarEjercicioMultiple = (id: string, campos: Partial<Ejercicio>) => {
    setEjercicios(ejercicios.map((e) => (e.id === id ? { ...e, ...campos } : e)))
  }

  const guardarEjercicios = () => {
    // Filtrar ejercicios que tienen tipo y actividad seleccionados
    const ejerciciosCompletos = ejercicios.filter(
      (e) => e.tipo && e.actividad && e.actividad.trim() !== ""
    )
    
    if (ejerciciosCompletos.length === 0) {
      alert("Por favor, completa al menos una actividad antes de guardar.")
      return
    }

    console.log("[v0] Guardando ejercicios:", ejerciciosCompletos)
    
    // Cargar ejercicios existentes del localStorage
    const ejerciciosExistentes = localStorage.getItem(`ejercicios-${user?.email}`)
    let todosLosEjercicios: Ejercicio[] = []
    
    if (ejerciciosExistentes) {
      try {
        todosLosEjercicios = JSON.parse(ejerciciosExistentes)
      } catch (error) {
        console.error("Error al cargar ejercicios existentes:", error)
        todosLosEjercicios = []
      }
    }
    
    // Combinar con los nuevos ejercicios
    const ejerciciosActualizados = [...todosLosEjercicios, ...ejerciciosCompletos]
    
    // Guardar en localStorage
    localStorage.setItem(`ejercicios-${user?.email}`, JSON.stringify(ejerciciosActualizados))
    
    alert(`Se guardaron ${ejerciciosCompletos.length} actividades correctamente.`)
    router.push("/cliente/agenda")
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
                <Avatar className="h-16 w-16 border-4 border-white/20">
                  <AvatarImage src={"/placeholder.svg"} />
                  <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold text-xl">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl font-bold text-white">Registrar Actividad</CardTitle>
                  <p className="text-orange-100">{user?.name}</p>
                  <p className="text-sm text-orange-200">{user?.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                onClick={() => router.push("/")}
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
                  <p className="text-2xl font-bold text-primary">En Progreso</p>
                  <p className="text-sm text-muted-foreground">Estado</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="p-2 bg-primary rounded-full">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">Cliente</p>
                  <p className="text-sm text-muted-foreground">Tipo de cuenta</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="p-2 bg-primary rounded-full">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{new Date().toLocaleDateString("es-ES")}</p>
                  <p className="text-sm text-muted-foreground">Fecha actual</p>
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
                <span>Registro de Actividades</span>
              </CardTitle>
              <Button onClick={agregarEjercicio} className="bg-primary hover:bg-primary/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Actividad
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="col-span-3 font-semibold text-foreground">Fecha</div>
                <div className="col-span-8 font-semibold text-foreground">Actividad</div>
                <div className="col-span-1 font-semibold text-foreground">Acción</div>
              </div>

              {ejercicios.map((ejercicio) => (
                <div
                  key={ejercicio.id}
                  className="space-y-4 p-4 border border-border rounded-lg bg-card hover:border-primary/50 transition-all duration-200"
                >
                  {/* Primera fila: Fecha y Actividad */}
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-3">
                      <Select
                        value={ejercicio.fecha}
                        onValueChange={(value) => actualizarEjercicio(ejercicio.id, "fecha", value)}
                      >
                        <SelectTrigger className="bg-background border-border text-foreground">
                          <SelectValue placeholder="Seleccionar fecha" />
                        </SelectTrigger>
                        <SelectContent>
                          {fechasDisponibles.map((fecha) => (
                            <SelectItem key={fecha.valor} value={fecha.valor}>
                              {fecha.etiqueta}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="col-span-8">
                      {/* Selector único que cambia según el contexto */}
                      {ejercicio.tipo === "clase" ? (
                        // Mostrar selector de clases y duración
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Clase</label>
                            <Select
                              value={ejercicio.actividad}
                              onValueChange={(value) => {
                                actualizarEjercicio(ejercicio.id, "actividad", value)
                              }}
                            >
                              <SelectTrigger className="bg-background border-border text-foreground">
                                <SelectValue placeholder="Seleccionar clase" />
                              </SelectTrigger>
                              <SelectContent>
                                {clasesDisponibles.map((clase) => (
                                  <SelectItem key={clase} value={clase}>
                                    {clase}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Duración</label>
                            <Select
                              value={ejercicio.duracion?.toString() || ""}
                              onValueChange={(value) => actualizarEjercicio(ejercicio.id, "duracion", Number(value))}
                            >
                              <SelectTrigger className="bg-background border-border text-foreground">
                                <SelectValue placeholder="Seleccionar duración" />
                              </SelectTrigger>
                              <SelectContent>
                                {duracionesClase.map((duracion) => (
                                  <SelectItem key={duracion} value={duracion.toString()}>
                                    {duracion} min
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ) : ejercicio.tipo === "fuerza" ? (
                        // Mostrar selector de ejercicios de fuerza
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">Ejercicio de Fuerza</label>
                          <Select
                            value={ejercicio.actividad}
                            onValueChange={(value) => {
                              actualizarEjercicio(ejercicio.id, "actividad", value)
                            }}
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
                      ) : (
                        // Selector inicial para elegir tipo
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Clases</label>
                            <Select
                              value={ejercicio.tipo === "clase" ? ejercicio.actividad : ""}
                              onValueChange={(value) => {
                                actualizarEjercicioMultiple(ejercicio.id, {
                                  tipo: "clase",
                                  actividad: value,
                                  // Limpiar campos de fuerza
                                  series: undefined,
                                  repeticiones: undefined,
                                  peso: undefined
                                })
                              }}
                            >
                              <SelectTrigger className="bg-background border-border text-foreground">
                                <SelectValue placeholder="Seleccionar clase" />
                              </SelectTrigger>
                              <SelectContent>
                                {clasesDisponibles.map((clase) => (
                                  <SelectItem key={clase} value={clase}>
                                    {clase}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Ejercicios de Fuerza</label>
                            <Select
                              value={ejercicio.tipo === "fuerza" ? ejercicio.actividad : ""}
                              onValueChange={(value) => {
                                actualizarEjercicioMultiple(ejercicio.id, {
                                  tipo: "fuerza",
                                  actividad: value,
                                  // Limpiar campo de clase
                                  duracion: undefined
                                })
                              }}
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
                        </div>
                      )}
                    </div>
                    
                    <div className="col-span-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white bg-transparent mt-6"
                        onClick={() => eliminarEjercicio(ejercicio.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Segunda fila: Campos condicionales solo para ejercicios de fuerza */}
                  {ejercicio.actividad && ejercicio.tipo === "fuerza" && (
                    <div className="pt-2 border-t border-border">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">Series</label>
                          <Select
                            value={ejercicio.series?.toString() || ""}
                            onValueChange={(value) => actualizarEjercicio(ejercicio.id, "series", Number(value))}
                          >
                            <SelectTrigger className="bg-background border-border text-foreground">
                              <SelectValue placeholder="Seleccionar series" />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5].map((serie) => (
                                <SelectItem key={serie} value={serie.toString()}>
                                  {serie} serie{serie > 1 ? "s" : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">Repeticiones</label>
                          <Select
                            value={ejercicio.repeticiones?.toString() || ""}
                            onValueChange={(value) => actualizarEjercicio(ejercicio.id, "repeticiones", Number(value))}
                          >
                            <SelectTrigger className="bg-background border-border text-foreground">
                              <SelectValue placeholder="Seleccionar repeticiones" />
                            </SelectTrigger>
                            <SelectContent>
                              {repeticionesDisponibles.map((rep) => (
                                <SelectItem key={rep} value={rep.toString()}>
                                  {rep} reps
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">Peso (kg)</label>
                          <Select
                            value={ejercicio.peso?.toString() || ""}
                            onValueChange={(value) => actualizarEjercicio(ejercicio.id, "peso", Number(value))}
                          >
                            <SelectTrigger className="bg-background border-border text-foreground">
                              <SelectValue placeholder="Seleccionar peso" />
                            </SelectTrigger>
                            <SelectContent>
                              {pesosDisponibles.map((peso) => (
                                <SelectItem key={peso} value={peso.toString()}>
                                  {peso} kg
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={guardarEjercicios} className="bg-primary hover:bg-primary/90 text-white">
                <Save className="h-4 w-4 mr-2" />
                Guardar Registro de Actividades
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}