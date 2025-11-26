"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import { API_CONFIG } from "@/lib/config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Activity, Users, Plus, Save, ArrowLeft, Trash2, CheckCircle2, Clock, Calendar, Check, ChevronDown } from "lucide-react"

interface Ejercicio {
  id: string
  fecha: string
  actividad: string // Nombre del ejercicio
  ejercicio_id?: number // ID del ejercicio en la tabla ejercicios
  // Campos para registro detallado
  series_realizadas?: number
  repeticiones?: number
  peso_kg?: number
  tiempo_minutos?: number
  distancia_metros?: number
  notas?: string
  valoracion?: number // 1-10
}

interface EntrenamientoPendiente {
  id: number
  fecha_entrenamiento: string
  series_planificadas: number
  ejercicio: {
    id: number
    nombre: string
    categoria: string
    descripcion: string
  }
  entrenador_nombre: string
}

interface ClaseReservada {
  id: number
  id_clase_programada: number
  estado: string
  clase: {
    fecha: string
    hora: string
    tipo: string
    color: string
    instructor: string
  }
}

export default function RegistrarEjercicioPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([])
  const [ejerciciosDisponibles, setEjerciciosDisponibles] = useState<any[]>([])
  const [entrenamientosPendientes, setEntrenamientosPendientes] = useState<EntrenamientoPendiente[]>([])
  const [clasesReservadas, setClasesReservadas] = useState<ClaseReservada[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const toast = useToast()

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

  // Debug: observar cambios en los estados
  useEffect(() => {
    console.log("[DEBUG] Estados actualizados - Entrenamientos:", entrenamientosPendientes.length, "Clases:", clasesReservadas.length)
  }, [entrenamientosPendientes, clasesReservadas])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }

    if (user?.role !== "cliente") {
      router.push("/")
      return
    }

    if (!user?.id) {
      console.log("[DEBUG] Usuario ID no disponible aún, esperando...")
      return
    }

    console.log("[DEBUG] Iniciando carga de datos para usuario:", user.id)

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

    // Cargar entrenamientos pendientes
    const cargarEntrenamientosPendientes = async () => {
      try {
  const response = await fetch(`${API_CONFIG.BASE_URL}/cliente/${user?.id}/entrenamientos-pendientes`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setEntrenamientosPendientes(data.entrenamientos_pendientes || [])
            console.log("[DEBUG] Entrenamientos pendientes cargados:", data.entrenamientos_pendientes)
          }
        } else {
          console.error("[ERROR] Error al cargar entrenamientos pendientes:", response.status)
        }
      } catch (error) {
        console.error("[ERROR] Error al cargar entrenamientos pendientes:", error)
      }
    }

    // Cargar ejercicios disponibles
    const cargarEjerciciosDisponibles = async () => {
      try {
  const response = await fetch(`${API_CONFIG.BASE_URL}/ejercicios`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setEjerciciosDisponibles(data.ejercicios || [])
            console.log("[DEBUG] Ejercicios disponibles cargados:", data.ejercicios)
          }
        } else {
          console.error("[ERROR] Error al cargar ejercicios:", response.status)
        }
      } catch (error) {
        console.error("[ERROR] Error al cargar ejercicios:", error)
      }
    }

    // Cargar clases reservadas
    const cargarClasesReservadas = async () => {
      try {
        console.log("[DEBUG] Usuario completo:", user)
        console.log("[DEBUG] ID del usuario:", user?.id)
        console.log("[DEBUG] Cargando clases reservadas para usuario:", user?.id)
        
        if (!user?.id) {
          console.error("[ERROR] No hay user.id disponible")
          return
        }
        
  const url = `${API_CONFIG.BASE_URL}/user/${user.id}/reservas`
        console.log("[DEBUG] URL de la petición:", url)
        
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        console.log("[DEBUG] Respuesta status:", response.status)

        if (response.ok) {
          const data = await response.json()
          console.log("[DEBUG] Respuesta API reservas:", data)
          console.log("[DEBUG] Tipo de data:", typeof data, "Es array:", Array.isArray(data))
          
          if (!Array.isArray(data)) {
            console.error("[ERROR] La respuesta no es un array:", data)
            return
          }
          
          // Filtrar solo las clases activas (no completadas)
          const clasesActivas = data.filter((reserva: ClaseReservada) => {
            console.log("[DEBUG] Procesando reserva:", reserva.id, "estado:", reserva.estado)
            return reserva.estado === 'activa'
          })
          console.log("[DEBUG] Clases activas filtradas:", clasesActivas)
          setClasesReservadas(clasesActivas || [])
          console.log("[DEBUG] Estado actualizado - clases reservadas:", clasesActivas.length)
        } else {
          console.error("[ERROR] Error al cargar clases reservadas:", response.status)
          const errorText = await response.text()
          console.error("[ERROR] Detalle del error:", errorText)
        }
      } catch (error) {
        console.error("[ERROR] Error al cargar clases reservadas:", error)
      }
    }

    cargarEntrenamientosPendientes()
    cargarEjerciciosDisponibles()
    cargarClasesReservadas()
    setIsLoading(false)
  }, [isAuthenticated, router, user?.role, user?.id])

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

  const registrarActividadPlanificada = async (entrenamiento: EntrenamientoPendiente, datosCompletados: any) => {
    try {
      const actividadData = {
        id_ejercicio: entrenamiento.ejercicio.id,
        id_entrenamiento_asignado: entrenamiento.id,
        fecha_realizacion: new Date().toISOString().split('T')[0], // Fecha de hoy
        series_realizadas: datosCompletados.series_realizadas,
        repeticiones: datosCompletados.repeticiones || null,
        peso_kg: datosCompletados.peso_kg || null,
        tiempo_segundos: datosCompletados.tiempo_segundos || null,
        distancia_metros: datosCompletados.distancia_metros || null,
        notas: datosCompletados.notas || "",
        valoracion: datosCompletados.valoracion || null
      }

      console.log("[DEBUG] Registrando actividad planificada:", actividadData)

  const response = await fetch(`${API_CONFIG.BASE_URL}/cliente/${user?.id}/registrar-actividad`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(actividadData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `Error HTTP: ${response.status}`)
      }

      const data = await response.json()
      console.log("[DEBUG] Actividad registrada:", data)

      if (data.success) {
        toast({ title: 'Actividad registrada', description: '¡Actividad registrada exitosamente!', type: 'success' })
        // Solo eliminamos el entrenamiento de la lista
        setEntrenamientosPendientes(prev => prev.filter(e => e.id !== entrenamiento.id))
      } else {
        throw new Error(data.message || "Error al registrar actividad")
      }

    } catch (error) {
      console.error("[ERROR] Error al registrar actividad:", error)
      toast({ title: 'Error', description: String(error instanceof Error ? error.message : 'Error desconocido'), type: 'error' })
    }
  }

  const registrarAsistenciaClase = async (claseReservada: ClaseReservada) => {
    try {
      console.log("[DEBUG] Registrando asistencia a clase:", claseReservada)

  const response = await fetch(`${API_CONFIG.BASE_URL}/reservas/${claseReservada.id}/registrar-asistencia`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `Error HTTP: ${response.status}`)
      }

      const data = await response.json()
      console.log("[DEBUG] Asistencia registrada:", data)

      if (data.success) {
        toast({ title: 'Asistencia registrada', description: `Asistencia a ${claseReservada.clase.tipo} registrada correctamente.`, type: 'success' })
        // Remover la clase de la lista de reservadas activas
        setClasesReservadas(prev => prev.filter(c => c.id !== claseReservada.id))
      } else if (data.already_registered) {
        toast({ title: 'Ya registrada', description: 'Ya se registró la asistencia a esta clase', type: 'info' })
        // También remover de la lista si ya fue registrada
        setClasesReservadas(prev => prev.filter(c => c.id !== claseReservada.id))
      } else {
        throw new Error(data.message || "Error al registrar asistencia")
      }

    } catch (error) {
      console.error("[ERROR] Error al registrar asistencia:", error)
      toast({ title: 'Error', description: String(error instanceof Error ? error.message : 'Error desconocido'), type: 'error' })
    }
  }

  const guardarEjercicios = async () => {
    // Filtrar ejercicios que tienen actividad seleccionada
    const ejerciciosCompletos = ejercicios.filter(
      (e) => e.actividad && e.actividad.trim() !== ""
    )
    
    if (ejerciciosCompletos.length === 0) {
      toast({ title: 'Atención', description: 'Por favor, completa al menos una actividad antes de guardar.', type: 'info' })
      return
    }

    try {
      console.log("[DEBUG] Guardando ejercicios en base de datos:", ejerciciosCompletos)
      
      const actividadesRegistradas = []
      
      for (const ejercicio of ejerciciosCompletos) {
        const actividadData = {
          id_ejercicio: ejercicio.ejercicio_id, // ID del ejercicio seleccionado
          id_entrenamiento_asignado: null, // NULL porque es actividad libre
          fecha_realizacion: ejercicio.fecha,
          series_realizadas: ejercicio.series_realizadas || null,
          repeticiones: ejercicio.repeticiones || null,
          peso_kg: ejercicio.peso_kg || null,
          tiempo_segundos: ejercicio.tiempo_minutos ? ejercicio.tiempo_minutos * 60 : null,
          distancia_metros: ejercicio.distancia_metros || null,
          notas: ejercicio.notas || "",
          valoracion: ejercicio.valoracion || null
        }

  const response = await fetch(`${API_CONFIG.BASE_URL}/cliente/${user?.id}/registrar-actividad`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(actividadData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.detail || `Error HTTP: ${response.status}`)
        }

        const data = await response.json()
        if (data.success) {
          actividadesRegistradas.push(data)
        }
      }
      
      toast({ title: 'Actividades guardadas', description: `Se registraron ${actividadesRegistradas.length} actividades correctamente.`, type: 'success' })
      // Limpiar el formulario y añadir uno nuevo vacío
      const hoy = new Date()
      const dia = hoy.getDate().toString().padStart(2, '0')
      const mes = (hoy.getMonth() + 1).toString().padStart(2, '0')
      const anio = hoy.getFullYear()

      setEjercicios([{
        id: Date.now().toString(),
        fecha: `${anio}-${mes}-${dia}`,
        actividad: ""
      }])
      
    } catch (error) {
      console.error("[ERROR] Error al guardar ejercicios:", error)
      toast({ title: 'Error al guardar', description: String(error instanceof Error ? error.message : 'Error desconocido'), type: 'error' })
    }
  }

  // Combinar entrenamientos pendientes y clases reservadas, ordenados por fecha
  const actividadesPendientes = useMemo(() => {
    const actividades: Array<{tipo: 'entrenamiento' | 'clase', fecha: string, data: EntrenamientoPendiente | ClaseReservada}> = []
    
    // Agregar entrenamientos pendientes
    entrenamientosPendientes.forEach(entrenamiento => {
      actividades.push({
        tipo: 'entrenamiento',
        fecha: entrenamiento.fecha_entrenamiento,
        data: entrenamiento
      })
    })
    
    // Agregar clases reservadas
    clasesReservadas.forEach(clase => {
      actividades.push({
        tipo: 'clase',
        fecha: clase.clase.fecha,
        data: clase
      })
    })
    
    // Ordenar por fecha
    return actividades.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
  }, [entrenamientosPendientes, clasesReservadas])

  // UI state for collapsed days
  const [openDays, setOpenDays] = useState<Record<string, boolean>>({})

  const groupedByDate = useMemo(() => {
    const map = new Map<string, Array<typeof actividadesPendientes[number]>>()
    actividadesPendientes.forEach((act) => {
      const key = act.fecha
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(act)
    })
    const arr = Array.from(map.entries()).map(([date, items]) => ({ date, items }))
    // ordenar por fecha descendente (más reciente primero)
    arr.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return arr
  }, [actividadesPendientes])

  const formatDateLabel = (fecha: string) => {
    try {
      return new Date(fecha).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })
    } catch {
      return fecha
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    )
  }

  // Debug final antes del render
  console.log("[DEBUG RENDER] Estados finales:", {
    entrenamientosPendientes: entrenamientosPendientes.length,
    clasesReservadas: clasesReservadas.length,
    actividadesPendientes: actividadesPendientes.length,
    userId: user?.id
  })

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16 border-4 border-white/20">
                <AvatarImage src={"/placeholder.svg"} />
                <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold text-xl">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">Registrar Actividad</h2>
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
        </div>

        {/* Stats removed as requested */}

        {/* Actividades planificadas agrupadas por día (colapsables) */}
        {groupedByDate.length > 0 && (
          <div className="space-y-4">
            {groupedByDate.map((group) => {
              const ejerciciosCount = group.items.filter((i) => i.tipo === "entrenamiento").length
              const clasesCount = group.items.filter((i) => i.tipo === "clase").length
              const isOpen = !!openDays[group.date]

              return (
                <div key={group.date} className="mb-1">
                  {/* Compact green header band (no outer frame) */}
                  <div className="bg-gradient-to-r from-green-900 to-green-800 text-white py-1 px-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3 truncate">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium truncate">{formatDateLabel(group.date)}</span>
                        <span className="text-white/80 mx-1">•</span>
                        <span className="text-white/90">{ejerciciosCount} ejercicios</span>
                        <span className="text-white/90 ml-2">{clasesCount} clases</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="p-1"
                        onClick={() => setOpenDays((prev) => ({ ...prev, [group.date]: !prev[group.date] }))}
                      >
                        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </Button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="px-3 py-2">
                      <div className="space-y-3">
                        {group.items.map((actividad, index) => (
                          <div key={`${actividad.tipo}-${group.date}-${index}`}>
                            {actividad.tipo === 'entrenamiento' ? (
                              <EntrenamientoPendienteCard
                                entrenamiento={actividad.data as EntrenamientoPendiente}
                                onRegistrar={registrarActividadPlanificada}
                              />
                            ) : (
                              <ClaseReservadaCard
                                claseReservada={actividad.data as ClaseReservada}
                                onRegistrar={registrarAsistenciaClase}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

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
                      <label className="text-sm font-medium text-foreground mb-2 block">Fecha</label>
                      <Input
                        type="date"
                        value={ejercicio.fecha}
                        onChange={(e) => actualizarEjercicio(ejercicio.id, "fecha", e.target.value)}
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    
                    <div className="col-span-8">
                      <label className="text-sm font-medium text-foreground mb-2 block">Ejercicio</label>
                      <Select
                        value={ejercicio.actividad}
                        onValueChange={(value) => {
                          const ejercicioSeleccionado = ejerciciosDisponibles.find(e => e.nombre === value)
                          actualizarEjercicioMultiple(ejercicio.id, {
                            actividad: value,
                            ejercicio_id: ejercicioSeleccionado?.id
                          })
                        }}
                      >
                        <SelectTrigger className="bg-background border-border text-foreground">
                          <SelectValue placeholder="Seleccionar ejercicio" />
                        </SelectTrigger>
                        <SelectContent>
                          {ejerciciosDisponibles.map((ejercicio_item) => (
                            <SelectItem key={ejercicio_item.id} value={ejercicio_item.nombre}>
                              {ejercicio_item.nombre} ({ejercicio_item.categoria})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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

                  {/* Segunda fila: Campos de registro detallado */}
                  {ejercicio.actividad && (
                    <div className="pt-4 border-t border-border">
                      <div className="grid grid-cols-2 gap-6">
                        {/* Columna izquierda */}
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Series realizadas</label>
                            <Input
                              type="number"
                              placeholder="Número de series"
                              value={ejercicio.series_realizadas || ""}
                              onChange={(e) => actualizarEjercicio(ejercicio.id, "series_realizadas", Number(e.target.value))}
                              className="bg-background border-border text-foreground"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Repeticiones</label>
                            <Input
                              type="number"
                              placeholder="Repeticiones por serie"
                              value={ejercicio.repeticiones || ""}
                              onChange={(e) => actualizarEjercicio(ejercicio.id, "repeticiones", Number(e.target.value))}
                              className="bg-background border-border text-foreground"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Peso (kg)</label>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="Peso utilizado"
                              value={ejercicio.peso_kg || ""}
                              onChange={(e) => actualizarEjercicio(ejercicio.id, "peso_kg", Number(e.target.value))}
                              className="bg-background border-border text-foreground"
                            />
                          </div>
                        </div>
                        
                        {/* Columna derecha */}
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Tiempo (minutos)</label>
                            <Input
                              type="number"
                              placeholder="Duración en minutos"
                              value={ejercicio.tiempo_minutos || ""}
                              onChange={(e) => actualizarEjercicio(ejercicio.id, "tiempo_minutos", Number(e.target.value))}
                              className="bg-background border-border text-foreground"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Distancia (metros)</label>
                            <Input
                              type="number"
                              placeholder="Distancia recorrida"
                              value={ejercicio.distancia_metros || ""}
                              onChange={(e) => actualizarEjercicio(ejercicio.id, "distancia_metros", Number(e.target.value))}
                              className="bg-background border-border text-foreground"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Valoración (1-5)</label>
                            <Select
                              value={ejercicio.valoracion?.toString() || ""}
                              onValueChange={(value) => actualizarEjercicio(ejercicio.id, "valoracion", Number(value))}
                            >
                              <SelectTrigger className="bg-background border-border text-foreground">
                                <SelectValue placeholder="Califica tu ejercicio" />
                              </SelectTrigger>
                              <SelectContent>
                                {[1, 2, 3, 4, 5].map((rating) => (
                                  <SelectItem key={rating} value={rating.toString()}>
                                    {rating === 1 ? '⭐ - Muy difícil' : rating === 2 ? '⭐⭐ - Difícil' : rating === 3 ? '⭐⭐⭐ - Normal' : rating === 4 ? '⭐⭐⭐⭐ - Bien' : '⭐⭐⭐⭐⭐ - Excelente'}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      
                      {/* Notas - ocupa toda la fila */}
                      <div className="mt-4">
                        <label className="text-sm font-medium text-foreground mb-2 block">Notas adicionales</label>
                        <textarea
                          placeholder="Observaciones sobre el ejercicio..."
                          value={ejercicio.notas || ""}
                          onChange={(e) => actualizarEjercicio(ejercicio.id, "notas", e.target.value)}
                          className="w-full p-3 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground resize-none"
                          rows={2}
                        />
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

// Componente para mostrar cada clase reservada
interface ClaseReservadaCardProps {
  claseReservada: ClaseReservada
  onRegistrar: (claseReservada: ClaseReservada) => void
}

function ClaseReservadaCard({ claseReservada, onRegistrar }: ClaseReservadaCardProps) {
  const fechaClase = new Date(claseReservada.clase.fecha)
  const horaClase = claseReservada.clase.hora

  return (
    <div className="border border-border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500 rounded-full">
            <Calendar className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{claseReservada.clase.tipo}</h3>
            <p className="text-sm text-muted-foreground">
              {fechaClase.toLocaleDateString('es-ES')} • {horaClase} • Instructor: {claseReservada.clase.instructor}
            </p>
            <p className="text-xs text-purple-600">Clase reservada</p>
          </div>
        </div>
        <Button
          onClick={() => onRegistrar(claseReservada)}
          className="bg-purple-500 hover:bg-purple-600 text-white"
          size="sm"
        >
          <Check className="h-4 w-4 mr-1" />
          Registrar Asistencia
        </Button>
      </div>
    </div>
  )
}

// Componente para mostrar cada entrenamiento pendiente
interface EntrenamientoPendienteCardProps {
  entrenamiento: EntrenamientoPendiente
  onRegistrar: (entrenamiento: EntrenamientoPendiente, datos: any) => void
}

function EntrenamientoPendienteCard({ entrenamiento, onRegistrar }: EntrenamientoPendienteCardProps) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [datosActividad, setDatosActividad] = useState({
    series_realizadas: entrenamiento.series_planificadas,
    repeticiones: '',
    peso_kg: '',
    tiempo_segundos: '',
    distancia_metros: '',
    notas: '',
    valoracion: ''
  })
  const toast = useToast()

  const handleRegistrar = () => {
    // Validar datos obligatorios
    if (!datosActividad.series_realizadas || datosActividad.series_realizadas <= 0) {
      toast({ title: 'Atención', description: 'Por favor, ingresa el número de series realizadas', type: 'info' })
      return
    }

    // Convertir strings a números donde sea necesario
    const datosParaEnviar = {
      series_realizadas: Number(datosActividad.series_realizadas),
      repeticiones: datosActividad.repeticiones ? Number(datosActividad.repeticiones) : null,
      peso_kg: datosActividad.peso_kg ? Number(datosActividad.peso_kg) : null,
      tiempo_segundos: datosActividad.tiempo_segundos ? Number(datosActividad.tiempo_segundos) : null,
      distancia_metros: datosActividad.distancia_metros ? Number(datosActividad.distancia_metros) : null,
      notas: datosActividad.notas,
      valoracion: datosActividad.valoracion ? Number(datosActividad.valoracion) : null
    }

    onRegistrar(entrenamiento, datosParaEnviar)
    // Cerramos el formulario después de registrar
    setMostrarFormulario(false)
  }

  return (
    <div className="border border-border rounded-lg p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-500 rounded-full">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{entrenamiento.ejercicio.nombre}</h3>
            <p className="text-sm text-muted-foreground">
              {entrenamiento.ejercicio.categoria} • {entrenamiento.series_planificadas} series • {new Date(entrenamiento.fecha_entrenamiento).toLocaleDateString('es-ES')}
            </p>
            <p className="text-xs text-green-600">Asignado por: {entrenamiento.entrenador_nombre}</p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {mostrarFormulario ? "Cancelar" : "Registrar"}
        </Button>
      </div>

      {entrenamiento.ejercicio.descripcion && (
        <p className="text-sm text-muted-foreground mb-3 italic">
          {entrenamiento.ejercicio.descripcion}
        </p>
      )}

      {mostrarFormulario && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border">
          <h4 className="font-medium mb-3">Completar registro de actividad</h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Series realizadas *</label>
              <Input
                type="number"
                min="1"
                value={datosActividad.series_realizadas}
                onChange={(e) => setDatosActividad(prev => ({ ...prev, series_realizadas: Number(e.target.value) }))}
                placeholder="Ej: 3"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Repeticiones</label>
              <Input
                type="number"
                min="1"
                value={datosActividad.repeticiones}
                onChange={(e) => setDatosActividad(prev => ({ ...prev, repeticiones: e.target.value }))}
                placeholder="Ej: 12"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Peso (kg)</label>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={datosActividad.peso_kg}
                onChange={(e) => setDatosActividad(prev => ({ ...prev, peso_kg: e.target.value }))}
                placeholder="Ej: 20"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Tiempo (segundos)</label>
              <Input
                type="number"
                min="1"
                value={datosActividad.tiempo_segundos}
                onChange={(e) => setDatosActividad(prev => ({ ...prev, tiempo_segundos: e.target.value }))}
                placeholder="Ej: 300"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Distancia (metros)</label>
              <Input
                type="number"
                min="1"
                value={datosActividad.distancia_metros}
                onChange={(e) => setDatosActividad(prev => ({ ...prev, distancia_metros: e.target.value }))}
                placeholder="Ej: 1000"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Valoración (1-5)</label>
              <Select
                value={datosActividad.valoracion}
                onValueChange={(value) => setDatosActividad(prev => ({ ...prev, valoracion: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Califica tu entrenamiento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">⭐ - Muy difícil</SelectItem>
                  <SelectItem value="2">⭐⭐ - Difícil</SelectItem>
                  <SelectItem value="3">⭐⭐⭐ - Normal</SelectItem>
                  <SelectItem value="4">⭐⭐⭐⭐ - Bien</SelectItem>
                  <SelectItem value="5">⭐⭐⭐⭐⭐ - Excelente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="text-sm font-medium mb-1 block">Notas</label>
            <Textarea
              value={datosActividad.notas}
              onChange={(e) => setDatosActividad(prev => ({ ...prev, notas: e.target.value }))}
              placeholder="¿Cómo te sentiste? ¿Algo que destacar?"
              rows={2}
            />
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={handleRegistrar}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Completar Entrenamiento
            </Button>
            <Button
              variant="outline"
              onClick={() => setMostrarFormulario(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}