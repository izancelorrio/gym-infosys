"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { API_CONFIG } from "@/lib/config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Calendar, Clock, Dumbbell, Hash } from "lucide-react"

interface EstadisticaEntrenamiento {
  id: number
  fecha: string
  ejercicio: string
  series: number
  repeticiones: number
  peso?: number | null
}

interface Cliente {
  id: number
  name: string
  email: string
  avatar?: string
}

export default function EstadisticasClientePage({ params }: { params: { clienteId: string } }) {
  const { user, isTrainer, isAuthenticated } = useAuth()
  const router = useRouter()
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [estadisticas, setEstadisticas] = useState<EstadisticaEntrenamiento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }

    if (!isTrainer()) {
      router.push("/")
      return
    }

    // Inicializar cliente mínimo (id) y solicitar estadísticas reales
    setCliente({ id: Number.parseInt(params.clienteId), name: "", email: "" })

    const fetchStats = async () => {
      setIsLoading(true)
      setServerError(null)
      try {
        const res = await fetch(`${API_CONFIG.BASE_URL}/cliente/${params.clienteId}/estadisticas`)
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }
        const json = await res.json()

        // Preferir la lista de ejercicios realizados si el backend la devuelve
        const realizados = json.ejercicios_realizados || []

        const mapped: EstadisticaEntrenamiento[] = realizados.map((r: any, idx: number) => ({
          id: idx + 1,
          fecha: r.fecha_realizacion || r.fecha || '',
          ejercicio: r.ejercicio_nombre || r.nombre || 'Ejercicio',
          series: Number(r.series_realizadas ?? r.series ?? 0) || 0,
          repeticiones: Number(r.repeticiones ?? 0) || 0,
          peso: r.peso_kg != null ? Number(r.peso_kg) : null
        }))

        setEstadisticas(mapped)
        // Si el backend devuelve información del cliente, usarla para la cabecera
        if (json.cliente) {
          try {
            setCliente((c) => ({
              id: c?.id ?? Number.parseInt(params.clienteId),
              name: json.cliente.name || (c?.name || `Cliente ${c?.id ?? params.clienteId}`),
              email: json.cliente.email || (c?.email || '')
            }))
          } catch (e) {
            // ignore
          }
        }

      } catch (err: any) {
        console.error("Error fetching client stats:", err)
        setServerError(err?.message || String(err))
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [isAuthenticated, isTrainer, router, params.clienteId])

  const handleVerDesglose = (estadisticaId: number, fecha: string) => {
    router.push(`/entrenador/estadisticas/${params.clienteId}/desglose/${estadisticaId}`)
  }

  const formatearFecha = (fecha: string) => {
    const d = new Date(fecha)
    if (isNaN(d.getTime())) {
      // Si no es una fecha válida (p. ej. backend devolvió un nombre de clase),
      // devolver la cadena tal cual para evitar 'Invalid Date'.
      return String(fecha)
    }
    return d.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Agrupar estadisticas por día (YYYY-MM-DD)
  const agrupadasPorDia = estadisticas.reduce((acc: Record<string, EstadisticaEntrenamiento[]>, item) => {
    const d = new Date(item.fecha)
    const key = isNaN(d.getTime()) ? String(item.fecha) : d.toISOString().slice(0, 10) // YYYY-MM-DD
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  // Ordenar claves de fecha ascendente (más antigua primero -> más arriba)
  const diasOrdenados = Object.keys(agrupadasPorDia).sort((a, b) => a.localeCompare(b))

  // Navegar a la pantalla de desglose para la fecha seleccionada
  const handleVerDesgloseDia = (diaKey: string) => {
    router.push(`/entrenador/estadisticas/${params.clienteId}/desglose/${encodeURIComponent(diaKey)}`)
  }

  // Semana seleccionada: offset relativo a la semana actual (0 = semana actual, -1 = anterior, ...)
  const [weekOffset, setWeekOffset] = useState<number>(0)

  const startOfWeekMonday = (d: Date) => {
    const date = new Date(d)
    const day = date.getDay() // 0 (Sun) - 6 (Sat)
    const diff = (day + 6) % 7 // days since Monday
    date.setDate(date.getDate() - diff)
    date.setHours(0, 0, 0, 0)
    return date
  }

  const today = new Date()
  const currentWeekStart = startOfWeekMonday(today)
  const selectedWeekStart = new Date(currentWeekStart)
  selectedWeekStart.setDate(currentWeekStart.getDate() + weekOffset * 7)
  selectedWeekStart.setHours(0, 0, 0, 0)
  const selectedWeekEnd = new Date(selectedWeekStart)
  selectedWeekEnd.setDate(selectedWeekStart.getDate() + 6)
  selectedWeekEnd.setHours(23, 59, 59, 999)

  const prevWeek = () => setWeekOffset((w) => w - 1)
  const nextWeek = () => setWeekOffset((w) => Math.min(0, w + 1))

  const formatShortDate = (isoOrDate: string | Date) => {
    const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate
    if (isNaN(d.getTime())) return String(isoOrDate)
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
  }

  // Filtrar dias para quedarnos solo con los que pertenezcan a la semana seleccionada
  const diasSemana = diasOrdenados.filter((diaKey) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(diaKey)) return false
    const d = new Date(diaKey + 'T00:00:00')
    return d.getTime() >= selectedWeekStart.getTime() && d.getTime() <= selectedWeekEnd.getTime()
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando estadísticas...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="border-4 border-white/20">
                <AvatarImage src={cliente?.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
                  {cliente?.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">Estadísticas de {cliente?.name || 'Nombre Cliente'}</h2>
                  <p className="text-orange-100">{cliente?.email || 'correo cliente'}</p>
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
        </div>

        {/* Stats under header */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="p-2 bg-primary rounded-full">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{Object.keys(agrupadasPorDia).length}</p>
              <p className="text-sm text-muted-foreground">Entrenamientos</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="p-2 bg-primary rounded-full">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{estadisticas.length}</p>
              <p className="text-sm text-muted-foreground">Ejercicios totales</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="p-2 bg-primary rounded-full">
              <Hash className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{estadisticas.reduce((acc, est) => acc + (est.series || 0), 0)}</p>
              <p className="text-sm text-muted-foreground">Series totales</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="p-2 bg-primary rounded-full">
              <Hash className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{estadisticas.reduce((acc, est) => acc + (est.repeticiones || 0), 0)}</p>
              <p className="text-sm text-muted-foreground">Repeticiones totales</p>
            </div>
          </div>
        </div>

        <Card className="border-border shadow-lg bg-card">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-foreground">
                <Calendar className="h-5 w-5" />
                <span className="font-medium">Historial de Entrenamientos</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-sm text-muted-foreground mr-2">Semana: {formatShortDate(selectedWeekStart)} — {formatShortDate(selectedWeekEnd)}</div>
                <Button size="sm" variant="outline" onClick={prevWeek}>Semana anterior</Button>
                <Button size="sm" variant="outline" onClick={nextWeek} disabled={weekOffset === 0}>Semana siguiente</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Column header removed as requested */}

              {diasSemana.length === 0 && (
                <div className="p-6 text-center text-muted-foreground">No se realizaron entrenamientos esta semana.</div>
              )}

              {diasSemana.map((diaKey) => {
                const items = agrupadasPorDia[diaKey] || []
                const displayDate = (() => {
                  // si la clave es YYYY-MM-DD, crear fecha para formatear bonito
                  if (/^\d{4}-\d{2}-\d{2}$/.test(diaKey)) return formatearFecha(diaKey)
                  return String(diaKey)
                })()

                return (
                  <div key={diaKey} className="space-y-2">
                    <div
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-border cursor-pointer"
                      onClick={() => handleVerDesgloseDia(diaKey)}
                    >
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-semibold text-foreground">{displayDate}</div>
                          <div className="text-sm text-muted-foreground">{items.length} ejercicio{items.length !== 1 ? 's' : ''}</div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">Ver desglose</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
