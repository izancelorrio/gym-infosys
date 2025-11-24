"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, Activity, Plus, Save, ArrowLeft, Trash2 } from "lucide-react"

interface ClaseProgramada {
  id: string
  fecha: string
  hora: string
  idClase: number
  instructor: string
  capacidad?: number
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

interface Entrenador {
  id: number
  name: string
  email: string
  role: string
  created_at: string
  updated_at: string
}

interface ClaseProgramadaDB {
  id: number
  fecha: string
  hora: string
  tipo_clase: string
  color?: string             // Color de la clase
  id_clase: number           // ID de la clase en gym_clases  
  instructor_id: number
  instructor_nombre: string  // Viene del JOIN con users.name
  capacidad_maxima: number
  participantes_actuales: number  // Calculado dinámicamente desde reservas
  plazas_libres: number           // Calculado dinámicamente  
  estado: string
  created_at: string
  updated_at: string
  descripcion?: string            // Campo opcional del backend
  duracion_minutos?: number       // Campo opcional del backend
}

export default function ProgramarClasePage() {
  const { user, isAdmin, isAuthenticated } = useAuth()
  const router = useRouter()
  const toast = useToast()

  const [clases, setClases] = useState<ClaseProgramada[]>([])
  const [tiposDeClase, setTiposDeClase] = useState<GymClase[]>([])
  const [entrenadores, setEntrenadores] = useState<Entrenador[]>([])
  const [clasesProgramadas, setClasesProgramadas] = useState<ClaseProgramadaDB[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const availableDates = useMemo(() => {
    const dates = []
    const today = new Date()

    // Generar los próximos 14 días empezando desde hoy
    for (let i = 0; i < 14; i++) {
      const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000)
      dates.push(date.toISOString().split("T")[0])
    }
    return dates
  }, [])





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

  const cargarEntrenadores = async () => {
    try {
      const timestamp = new Date().getTime()
      console.log(`[${timestamp}] Cargando entrenadores...`)
      
      const response = await fetch(`/api/entrenadores?_t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })

      if (!response.ok) {
        throw new Error(`Error al cargar entrenadores: ${response.status}`)
      }

      const data = await response.json()
      console.log(`[${timestamp}] Entrenadores cargados:`, data.length)
      setEntrenadores(data)
      
    } catch (error) {
      console.error('Error al cargar entrenadores:', error)
      // En caso de error, mantener array vacío 
      setEntrenadores([])
    }
  }

  const cargarClasesProgramadas = async () => {
    try {
      const timestamp = new Date().getTime()
      console.log(`[${timestamp}] Cargando clases programadas...`)
      
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

      const data = await response.json()
      console.log(`[${timestamp}] Clases programadas cargadas:`, data.length)
      setClasesProgramadas(data)
      
    } catch (error) {
      console.error('Error al cargar clases programadas:', error)
      // En caso de error, mantener array vacío 
      setClasesProgramadas([])
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
      // Cargar datos desde la base de datos
      await cargarTiposDeClase()
      await cargarEntrenadores()
      await cargarClasesProgramadas()
      
      // Inicializar con una clase vacía
        setClases([
          {
            id: Date.now().toString(),
            fecha: "",
            hora: "",
            idClase: 0,
            instructor: "",
            capacidad: 0,
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
      idClase: 0,
      instructor: "",
      capacidad: 0,
    }
    setClases([...clases, nuevaClase])
  }

  const eliminarClase = (id: string) => {
    setClases(clases.filter((c) => c.id !== id))
  }

  // Función para verificar si un horario está ocupado por un instructor
  const isHorarioOcupado = (instructorName: string, fecha: string, hora: string): boolean => {
    if (!instructorName || !fecha || !hora) return false
    
    return clasesProgramadas.some((clase: ClaseProgramadaDB) => 
      clase.instructor_nombre === instructorName && 
      clase.fecha === fecha && 
      clase.hora === hora &&
      (clase.estado === 'programada' || clase.estado === 'activa')
    )
  }

  const actualizarClase = (id: string, campo: keyof ClaseProgramada, valor: string | number) => {
    setClases(clases.map((c) => {
      if (c.id !== id) return c
      const updated: any = { ...c, [campo]: valor }
      // Si se cambia el tipo de clase (idClase), usar el max_participantes por defecto
      if (campo === 'idClase') {
        const tipo = tiposDeClase.find(t => t.id === Number(valor))
        if (tipo) {
          updated.capacidad = tipo.max_participantes || 0
        }
      }
      // Normalizar capacidad a número cuando se cambie
      if (campo === 'capacidad') {
        updated.capacidad = Number(valor) || 0
      }
      return updated
    }))
  }

  const guardarClases = async () => {
    try {
      const timestamp = new Date().getTime()
      console.log(`[${timestamp}] Guardando clases programadas:`, clases)

      // Filtrar solo las clases que tienen todos los campos completados
      const clasesCompletas = clases.filter(clase => 
        clase.fecha && clase.hora && clase.idClase > 0 && clase.instructor
      )

      if (clasesCompletas.length === 0) {
        toast({ title: "Campos incompletos", description: "Rellena todos los campos antes de guardar.", type: "error" })
        return
      }

      console.log(`[${timestamp}] Clases completas a guardar:`, clasesCompletas.length)

      // Preparar datos para enviar al backend
      const datosGuardar = {
        clases: clasesCompletas.map(clase => ({
          fecha: clase.fecha,
          hora: clase.hora,
          idClase: clase.idClase,
          instructor: clase.instructor,
          capacidad_maxima: clase.capacidad || null
        }))
      }

      const response = await fetch(`/api/clases-programadas?_t=${timestamp}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify(datosGuardar)
      })

      const resultado = await response.json()

      if (!response.ok) {
        throw new Error(resultado.details || resultado.error || 'Error al guardar clases')
      }

      console.log(`[${timestamp}] Resultado del guardado:`, resultado)

      // Mostrar mensaje de éxito/error
      if (resultado.success) {
        if (resultado.total_errores === 0) {
          toast({ title: `✅ ${resultado.total_guardadas} clases guardadas`, type: "success" })
          // pequeño delay para que el usuario vea la notificación
          setTimeout(() => router.push("/admin"), 800)
        } else {
          // Mostrar resumen de guardado con errores en un toast (descripcion corta)
          toast({ title: `Guardadas: ${resultado.total_guardadas}`, description: `Errores: ${resultado.total_errores}`, type: "info" })
        }
      } else {
        throw new Error(resultado.error || 'Error desconocido al guardar clases')
      }

    } catch (error) {
      console.error('Error al guardar clases:', error)
      toast({ title: "Error guardando clases", description: error instanceof Error ? error.message : 'Error desconocido', type: "error" })
    }
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
              <div className="grid grid-cols-14 gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="col-span-4 font-semibold text-foreground">Instructor</div>
                <div className="col-span-3 font-semibold text-foreground">Tipo de Clase</div>
                <div className="col-span-1 font-semibold text-foreground">Capacidad</div>
                <div className="col-span-3 font-semibold text-foreground">Fecha</div>
                <div className="col-span-2 font-semibold text-foreground">Hora</div>
                <div className="col-span-1 font-semibold text-foreground">Acción</div>
              </div>

              {clases.map((clase) => (
                <div
                  key={clase.id}
                  className="grid grid-cols-14 gap-4 p-4 border border-border rounded-lg bg-card hover:border-primary/50 transition-all duration-200"
                >
                  <div className="col-span-4">
                    <Select
                      value={clase.instructor}
                      onValueChange={(value) => actualizarClase(clase.id, "instructor", value)}
                    >
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue placeholder="Seleccionar instructor" />
                      </SelectTrigger>
                      <SelectContent>
                        {entrenadores.map((entrenador) => (
                          <SelectItem key={entrenador.id} value={entrenador.name}>
                            {entrenador.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <Select
                      value={clase.idClase ? clase.idClase.toString() : ""}
                      onValueChange={(value) => actualizarClase(clase.id, "idClase", parseInt(value))}
                    >
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue placeholder="Tipo de clase" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposDeClase.map((tipo) => (
                          <SelectItem key={tipo.id} value={tipo.id.toString()}>
                            {tipo.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <input
                      type="number"
                      min={1}
                      value={clase.capacidad ?? ''}
                      onChange={(e) => actualizarClase(clase.id, 'capacidad', Number(e.target.value))}
                      className="w-full bg-background border-border rounded px-2 py-1 text-sm"
                      placeholder="Cap"
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="date"
                      value={clase.fecha}
                      min={availableDates[0]}
                      max={availableDates[availableDates.length - 1]}
                      onChange={(e) => {
                        const v = e.target.value
                        const ocupado = clase.instructor && clase.hora && isHorarioOcupado(clase.instructor, v, clase.hora)
                        if (ocupado) {
                          toast({ title: 'Horario ocupado', description: 'La fecha y hora seleccionadas están ocupadas para este instructor.', type: 'info' })
                          return
                        }
                        actualizarClase(clase.id, "fecha", v)
                      }}
                      className="w-full bg-background border-border rounded px-2 py-1 text-sm"
                      placeholder="Seleccionar fecha"
                    />
                  </div>
                  <div className="col-span-2">
                    <Select value={clase.hora} onValueChange={(value) => actualizarClase(clase.id, "hora", value)}>
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue placeholder="Hora" />
                      </SelectTrigger>
                      <SelectContent>
                        {horariosDisponibles.map((hora) => {
                          const isOcupado = clase.instructor && clase.fecha && isHorarioOcupado(clase.instructor, clase.fecha, hora)
                          return (
                            <SelectItem 
                              key={hora} 
                              value={hora}
                              disabled={!!isOcupado}
                              className={isOcupado ? "text-red-500 bg-red-50" : ""}
                            >
                              {hora}
                              {isOcupado && " (Ocupado)"}
                            </SelectItem>
                          )
                        })}
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
