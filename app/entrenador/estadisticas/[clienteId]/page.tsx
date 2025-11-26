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
              <p className="text-2xl font-bold text-primary">{estadisticas.length}</p>
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
            <CardTitle className="flex items-center space-x-2 text-foreground">
              <Calendar className="h-5 w-5" />
              <span>Historial de Entrenamientos</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="font-semibold text-foreground">Ejercicio / Fecha</div>
                <div className="font-semibold text-foreground text-center">Series</div>
                <div className="font-semibold text-foreground text-center">Reps</div>
                <div className="font-semibold text-foreground text-center">Peso</div>
              </div>

              {estadisticas.map((estadistica) => (
                <div
                  key={estadistica.id}
                  className="grid grid-cols-4 gap-4 p-4 border border-border rounded-lg bg-card hover:bg-muted hover:border-primary/50 transition-all duration-200 shadow-sm cursor-pointer"
                >
                  <div className="text-foreground">
                    <div className="font-medium">{estadistica.ejercicio}</div>
                    <div className="text-sm text-muted-foreground">{formatearFecha(estadistica.fecha)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold">{estadistica.series}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold">{estadistica.repeticiones}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold">{estadistica.peso ?? '—'}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
