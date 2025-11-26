"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import { API_CONFIG } from "@/lib/config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Dumbbell,
  Calendar,
  Trophy,
  Users,
  Activity 
} from "lucide-react"

interface Ejercicio {
  id: string
  fecha: string
  tipo: "clase" | "fuerza"
  actividad: string
  // Campos para ejercicios de fuerza
  series?: number
  repeticiones?: number
  peso?: number
  // Campo para clases
  duracion?: number
}

interface EstadisticaClase {
  nombre: string
  frecuencia: number
  duracionTotal: number
  porcentaje: number
}

interface EstadisticaEjercicio {
  nombre: string
  frecuencia: number
  pesoMaximo: number
  volumenTotal: number
  porcentaje: number
}

export default function EstadisticasPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([])
  const [serverStats, setServerStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "cliente") {
      router.push("/")
      return
    }

    const cargarEstadisticas = async () => {
      if (!user?.id) return
      setIsLoading(true)
      try {
        const url = `${API_CONFIG.BASE_URL}/cliente/${user.id}/estadisticas`
        const resp = await fetch(url, { headers: { "Content-Type": "application/json" } })
        if (!resp.ok) {
          console.error("Error al obtener estadísticas del servidor:", resp.status)
          setServerStats(null)
          setIsLoading(false)
          return
        }

        const data = await resp.json()
        setServerStats(data)
      } catch (err) {
        console.error("Error al cargar estadísticas:", err)
        setServerStats(null)
      } finally {
        setIsLoading(false)
      }
    }

    cargarEstadisticas()
  }, [isAuthenticated, user, router])

  // Estadísticas de clases
  const estadisticasClases = useMemo((): EstadisticaClase[] => {
    if (serverStats && serverStats.estadisticasClases) {
      return serverStats.estadisticasClases.map((c: any) => ({
        nombre: c.nombre,
        frecuencia: c.frecuencia,
        duracionTotal: c.duracionTotal || 0,
        porcentaje: c.porcentaje || 0
      }))
    }

    const clases = ejercicios.filter(e => e.tipo === "clase")
    const conteoClases: { [key: string]: { count: number; duracionTotal: number } } = {}

    clases.forEach(clase => {
      if (!conteoClases[clase.actividad]) {
        conteoClases[clase.actividad] = { count: 0, duracionTotal: 0 }
      }
      conteoClases[clase.actividad].count++
      conteoClases[clase.actividad].duracionTotal += clase.duracion || 0
    })

    const totalClases = clases.length

    return Object.entries(conteoClases)
      .map(([nombre, data]) => ({
        nombre,
        frecuencia: data.count,
        duracionTotal: data.duracionTotal,
        porcentaje: totalClases > 0 ? (data.count / totalClases) * 100 : 0
      }))
      .sort((a, b) => b.frecuencia - a.frecuencia)
  }, [serverStats, ejercicios])

  // Estadísticas de ejercicios de fuerza
  const estadisticasEjercicios = useMemo((): EstadisticaEjercicio[] => {
    if (serverStats && serverStats.estadisticasEjercicios) {
      return serverStats.estadisticasEjercicios.map((e: any) => ({
        nombre: e.nombre,
        frecuencia: e.frecuencia,
        pesoMaximo: e.pesoMaximo || 0,
        volumenTotal: e.volumenTotal || 0,
        porcentaje: e.porcentaje || 0
      }))
    }

    const ejerciciosFuerza = ejercicios.filter(e => e.tipo === "fuerza")
    const conteoEjercicios: { [key: string]: { count: number; pesos: number[]; volumen: number } } = {}

    ejerciciosFuerza.forEach(ejercicio => {
      if (!conteoEjercicios[ejercicio.actividad]) {
        conteoEjercicios[ejercicio.actividad] = { count: 0, pesos: [], volumen: 0 }
      }
      conteoEjercicios[ejercicio.actividad].count++
      
      if (ejercicio.peso) {
        conteoEjercicios[ejercicio.actividad].pesos.push(ejercicio.peso)
        const volumen = ejercicio.peso * (ejercicio.series || 1) * (ejercicio.repeticiones || 1)
        conteoEjercicios[ejercicio.actividad].volumen += volumen
      }
    })

    const totalEjercicios = ejerciciosFuerza.length

    return Object.entries(conteoEjercicios)
      .map(([nombre, data]) => ({
        nombre,
        frecuencia: data.count,
        pesoMaximo: data.pesos.length > 0 ? Math.max(...data.pesos) : 0,
        volumenTotal: data.volumen,
        porcentaje: totalEjercicios > 0 ? (data.count / totalEjercicios) * 100 : 0
      }))
      .sort((a, b) => b.frecuencia - a.frecuencia)
  }, [serverStats, ejercicios])

  // Métricas generales
  const metricas = useMemo(() => {
    // Preferir datos del servidor si están disponibles
    if (serverStats && serverStats.estadisticas_generales) {
      const g = serverStats.estadisticas_generales
      return {
        totalActividades: g.totalActividades || 0,
        totalClases: g.totalClases || 0,
        totalEjercicios: g.totalEjercicios || 0,
        duracionTotalClases: g.duracionTotalClases || 0,
        diasActivos: g.diasActivos || 0,
        rachaActual: g.rachaActual || 0
      }
    }

    // Fallback: calcular desde ejercicios en cliente
    const totalActividades = ejercicios.length
    const totalClases = ejercicios.filter(e => e.tipo === "clase").length
    const totalEjercicios = ejercicios.filter(e => e.tipo === "fuerza").length
    const duracionTotalClases = ejercicios
      .filter(e => e.tipo === "clase")
      .reduce((total, clase) => total + (clase.duracion || 0), 0)
    
    // Calcular días únicos con actividad
    const fechasUnicas = new Set(ejercicios.map(e => e.fecha))
    const diasActivos = fechasUnicas.size

    // Calcular racha actual (días consecutivos con actividad)
    const fechasOrdenadas = Array.from(fechasUnicas).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    let rachaActual = 0
    const hoy = new Date()
    
    for (let i = 0; i < fechasOrdenadas.length; i++) {
      const fecha = new Date(fechasOrdenadas[i])
      const diferenciaDias = Math.floor((hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diferenciaDias === i) {
        rachaActual++
      } else {
        break
      }
    }

    return {
      totalActividades,
      totalClases,
      totalEjercicios,
      duracionTotalClases,
      diasActivos,
      rachaActual
    }
  }, [serverStats, ejercicios])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-lg shadow-lg mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-full">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Mis Estadísticas</h1>
                <p className="text-white/90">Resumen de tu actividad física</p>
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

        {/* Métricas Generales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-border shadow-lg bg-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Actividades</p>
                  <p className="text-3xl font-bold text-foreground">{metricas.totalActividades}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-lg bg-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-500/10 rounded-full">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Clases</p>
                  <p className="text-3xl font-bold text-foreground">{metricas.totalClases}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-lg bg-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-orange-500/10 rounded-full">
                  <Dumbbell className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ejercicios</p>
                  <p className="text-3xl font-bold text-foreground">{metricas.totalEjercicios}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-lg bg-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-500/10 rounded-full">
                  <Trophy className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Racha Actual</p>
                  <p className="text-3xl font-bold text-foreground">{metricas.rachaActual} días</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Estadísticas de Clases */}
          <Card className="border-border shadow-lg bg-card">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
              <CardTitle className="flex items-center space-x-2 text-foreground">
                <Users className="h-5 w-5" />
                <span>Estadísticas de Clases</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {estadisticasClases.length > 0 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-muted-foreground">Tiempo Total</span>
                      </div>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {metricas.duracionTotalClases} min
                      </p>
                    </div>
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-muted-foreground">Días Activos</span>
                      </div>
                      <p className="text-2xl font-bold text-foreground mt-1">{metricas.diasActivos}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-foreground">Clases Más Frecuentes</h4>
                    {estadisticasClases.slice(0, 5).map((clase, index) => (
                      <div key={clase.nombre} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-foreground">{clase.nombre}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">
                              {clase.frecuencia} veces
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({clase.porcentaje.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                        <Progress value={clase.porcentaje} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No has registrado clases aún</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Estadísticas de Ejercicios */}
          <Card className="border-border shadow-lg bg-card">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
              <CardTitle className="flex items-center space-x-2 text-foreground">
                <Dumbbell className="h-5 w-5" />
                <span>Estadísticas de Ejercicios</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {estadisticasEjercicios.length > 0 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-muted-foreground">Peso Máximo</span>
                      </div>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {Math.max(...estadisticasEjercicios.map(e => e.pesoMaximo))} kg
                      </p>
                    </div>
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-muted-foreground">Volumen Total</span>
                      </div>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {estadisticasEjercicios.reduce((total, e) => total + e.volumenTotal, 0)} kg
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-foreground">Ejercicios Más Frecuentes</h4>
                    {estadisticasEjercicios.slice(0, 5).map((ejercicio, index) => (
                      <div key={ejercicio.nombre} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-foreground">{ejercicio.nombre}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">
                              {ejercicio.frecuencia} veces
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({ejercicio.porcentaje.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                        <Progress value={ejercicio.porcentaje} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Max: {ejercicio.pesoMaximo} kg</span>
                          <span>Vol: {ejercicio.volumenTotal} kg</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No has registrado ejercicios aún</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}